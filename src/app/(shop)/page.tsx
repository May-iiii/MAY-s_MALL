import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAY's Mall - 精选好物",
};

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    // 精选商品直接在页面内查询（仅首页需要）
    import("@/lib/prisma").then(async ({ prisma }) =>
      prisma.product.findMany({
        where: { isPublished: true, isFeatured: true },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          image: true,
          stock: true,
          category: { select: { name: true, slug: true } },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
    ),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-16 text-white">
        <div className="page-container text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            MAY{"'"}s Mall
          </h1>
          <p className="mt-4 text-lg text-white/80">精选好物，品质生活</p>
          <Link
            href="/products"
            className="btn mt-8 inline-flex rounded-lg bg-white px-8 py-3 font-semibold text-primary hover:bg-white/90"
          >
            立即选购
          </Link>
        </div>
      </section>

      {/* 分类导航 */}
      {categories.length > 0 && (
        <section className="page-container py-12">
          <h2 className="text-2xl font-bold text-text-primary">商品分类</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="card flex flex-col items-center gap-2 py-6 text-center transition-shadow hover:shadow-md"
              >
                <span className="text-lg font-semibold text-text-primary">
                  {cat.name}
                </span>
                <span className="text-xs text-text-muted">
                  {cat.productCount} 件商品
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 精选商品 */}
      <section className="page-container pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">精选好物</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline"
          >
            查看全部 &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              comparePrice={product.comparePrice}
              image={product.image}
              stock={product.stock}
              category={product.category.name}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
