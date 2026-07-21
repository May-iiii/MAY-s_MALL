import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { parseJson } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { getMembershipDiscount } from "@/lib/membership";
import { MEMBERSHIP_TIERS, type MembershipTierKey } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ReviewForm } from "@/components/shop/ReviewForm";
import type { Metadata } from "next";

const getCachedProduct = cache(getProductBySlug);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) return { title: "商品未找到" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    notFound();
  }

  const images: string[] = Array.isArray(parseJson<string[]>(product.images, []))
    ? parseJson<string[]>(product.images, [])
    : [];
  const mainImage = product.image || (images.length > 0 ? images[0] : null);
  const hasComparePrice = product.comparePrice != null && product.comparePrice > product.price;

  // 会员价：登录用户按其等级折扣展示专属价
  const currentUser = await getCurrentUser();
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

  // 评价资格：已收货且未评价过
  let canReview = false;
  if (currentUser) {
    const [purchased, reviewed] = await Promise.all([
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
    ]);
    canReview = !!purchased && !reviewed;
  }

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
          <div className="aspect-square overflow-hidden rounded-xl bg-surface-secondary">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-cover"
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
                  className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border"
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
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
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImage={mainImage}
              stock={product.stock}
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
    </div>
  );
}
