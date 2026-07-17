import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { ProductCard } from "@/components/shop/ProductCard";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAY's Mall - 精选好物",
  description: "发现精选好物，享受品质生活。",
};

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    import("@/lib/prisma").then(async ({ prisma }) =>
      prisma.product.findMany({
        where: { isPublished: true, isFeatured: true },
        select: {
          id: true, name: true, slug: true, price: true, comparePrice: true,
          image: true, stock: true,
          category: { select: { name: true, slug: true } },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
    ),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero — text + image accordion */}
      <section className="page-container pt-24 pb-16 lg:pb-20">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* Left: Text */}
          <div className="w-full text-center lg:w-5/12 lg:text-left">
            <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
              MAY&apos;s Mall
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-stone-800 sm:text-5xl lg:text-6xl">
              精选好物
              <br />
              品质生活
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-stone-500 lg:mx-0">
              发现精心挑选的品质好物，从数码到家居，每一件都值得拥有
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-stone-800 px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-stone-900/10 transition-all hover:bg-stone-700 active:scale-[0.98]"
            >
              探索全部商品
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right: Image Accordion */}
          <div className="w-full lg:w-7/12">
            <LandingAccordionItem />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-container py-20 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 lg:text-4xl">
              按分类探索
            </h2>
            <p className="mt-3 text-stone-500">找到属于你的那一类</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat, i) => {
              const palettes = [
                "from-amber-100/80 via-orange-50/60 to-yellow-50/40",
                "from-emerald-100/80 via-green-50/60 to-teal-50/40",
                "from-blue-100/80 via-indigo-50/60 to-sky-50/40",
                "from-rose-100/80 via-pink-50/60 to-red-50/40",
                "from-violet-100/80 via-purple-50/60 to-fuchsia-50/40",
              ];
              const icons = ["👗", "📱", "🏠", "🍜", "📚"];
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${palettes[i % palettes.length]} p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]`}
                >
                  <span className="text-3xl">{icons[i % icons.length]}</span>
                  <p className="mt-4 text-lg font-bold text-stone-800">{cat.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{cat.productCount} 件商品</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="page-container pb-20 lg:pb-28">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 lg:text-4xl">
              本周精选
            </h2>
            <p className="mt-3 text-stone-500">我们为你挑选的好东西</p>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-stone-700 transition-colors hover:text-stone-900 sm:inline-flex items-center gap-1"
          >
            查看全部
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            查看全部商品
          </Link>
        </div>
      </section>
    </>
  );
}
