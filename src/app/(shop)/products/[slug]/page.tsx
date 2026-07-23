import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { parseJson } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { getMembershipDiscount } from "@/lib/membership";
import { MEMBERSHIP_TIERS, type MembershipTierKey } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { SpecSelectors } from "@/components/shop/SpecSelectors";
import { ReviewForm } from "@/components/shop/ReviewForm";
import type { Metadata } from "next";

export const revalidate = 120;

// 解析规格文本：每行格式 "名称:选项1,选项2"
function parseSpecsText(specsStr: string): { name: string; options: string[] }[] {
  try {
    return specsStr
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes(":"))
      .map((line) => {
        const [name, ...rest] = line.split(":");
        const options = rest
          .join(":")
          .split(/[,，]/)
          .map((o) => o.trim())
          .filter(Boolean);
        return { name: name.trim(), options };
      })
      .filter((s) => s.name && s.options.length > 0);
  } catch {
    return [];
  }
}

const getCachedProduct = cache(getProductBySlug);

type Props = {
  params: Promise<{ slug: string }>;
};

// 构建时预渲染所有已上架商品详情页
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

// Next.js 对含非 ASCII 字符的动态路由 segment，在部分渲染路径下可能仍是
// percent-encoded 原始值（而非解码后的文本），这里显式兜底解码一次。
function decodeSlugParam(raw: string): string {
  try {
    return /%[0-9A-Fa-f]{2}/.test(raw) ? decodeURIComponent(raw) : raw;
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(decodeSlugParam(slug));

  if (!product) return { title: "商品未找到" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // 第 1 轮并行：商品 + 用户（互不依赖）
  const [product, currentUser] = await Promise.all([
    getCachedProduct(decodeSlugParam(slug)),
    getCurrentUser().catch(() => null),
  ]);

  if (!product) {
    notFound();
  }

  const images: string[] = Array.isArray(parseJson<string[]>(product.images, []))
    ? parseJson<string[]>(product.images, [])
    : [];
  const mainImage = product.image || (images.length > 0 ? images[0] : null);
  const hasComparePrice = product.comparePrice != null && product.comparePrice > product.price;

  // 会员价：登录用户按其等级折扣展示专属价
  const discountRate = currentUser
    ? getMembershipDiscount(currentUser.membershipTier)
    : 0;
  const memberPrice =
    discountRate > 0
      ? Math.round(product.price * (1 - discountRate) * 100) / 100
      : null;
  const tierLabel = currentUser
    ? MEMBERSHIP_TIERS[currentUser.membershipTier as MembershipTierKey]?.label
    : null;

  // 第 2 轮并行：评价资格 + 同类推荐（都依赖 product，但互不依赖）
  const [canReviewResult, relatedProducts] = await Promise.all([
    currentUser
      ? Promise.all([
          prisma.orderItem.findFirst({
            where: {
              productId: product.id,
              order: { userId: currentUser.id, status: "DELIVERED" },
            },
            select: { id: true },
          }),
          prisma.review.findUnique({
            where: {
              userId_productId: { userId: currentUser.id, productId: product.id },
            },
            select: { id: true },
          }),
        ])
      : Promise.resolve([null, null]),
    prisma.product.findMany({
      where: { categoryId: product.categoryId, isPublished: true, id: { not: product.id } },
      select: { id: true, name: true, slug: true, price: true, image: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const canReview = canReviewResult
    ? !!canReviewResult[0] && !canReviewResult[1]
    : false;

  return (
    <div className="page-container py-8">
      {/* 面包屑 */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary">
          首页
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">
          商品
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 图片区 */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-secondary">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border"
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 信息区 */}
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">{product.category.name}</Badge>
            {product.stock > 0 ? (
              <Badge variant="success">有货</Badge>
            ) : (
              <Badge variant="danger">缺货</Badge>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-text-primary">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-danger">
              {formatPrice(product.price)}
            </span>
            {hasComparePrice && product.comparePrice && (
              <>
                <span className="text-lg text-text-muted line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge variant="danger">
                  {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {memberPrice != null && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Badge variant="warning">{tierLabel}</Badge>
              <span className="text-text-secondary">
                会员价 <span className="font-semibold text-accent">{formatPrice(memberPrice)}</span>
                <span className="ml-1 text-text-muted">（{(1 - discountRate) * 10} 折，结算时自动抵扣）</span>
              </span>
            </div>
          )}

          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <p className="text-sm leading-relaxed text-text-secondary">
              {product.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>库存：{product.stock} 件</span>
              {product.stock > 0 && (
                <span className="text-text-secondary">最快当天发货</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <SpecSelectors
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImage={mainImage}
              stock={product.stock}
              specs={parseSpecsText(product.specs || "")}
            />
          </div>
        </div>
      </div>

      {/* 商品评价 */}
      <section className="mt-16 border-t border-border pt-12">
        <h2 className="text-xl font-bold text-text-primary">
          商品评价 ({product.reviews.length})
        </h2>

        {canReview && (
          <div className="mt-6 max-w-xl">
            <ReviewForm productId={product.id} />
          </div>
        )}

        {product.reviews.length > 0 ? (
          <div className="mt-6 space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">
                    {review.user.name}
                  </span>
                  <span className="text-sm text-amber-500">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                {review.content && (
                  <p className="mt-2 text-sm text-text-secondary">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-text-muted">暂无评价</p>
        )}
      </section>

      {/* 同类推荐 */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-xl font-bold text-text-primary">相关推荐</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/products/${rp.slug}`}
                className="group rounded-xl border border-border bg-white p-3 transition-all hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-secondary">
                  {rp.image ? (
                    <Image
                      src={rp.image}
                      alt={rp.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-muted">
                      暂无图片
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-stone-800">
                  {rp.name}
                </p>
                <p className="mt-1 text-sm font-bold text-danger">
                  {formatPrice(rp.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
