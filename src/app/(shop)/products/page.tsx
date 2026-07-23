import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductSearch } from "@/components/shop/ProductSearch";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { Pagination } from "@/components/ui/Pagination";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "全部商品",
};

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [{ items: products, total, totalPages }, categories] = await Promise.all([
    getProducts({ search, category, page, pageSize: 9 }),
    getCategories(),
  ]);

  return (
    <div className="page-container py-8">
      {/* 搜索栏 */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-surface-secondary" />}>
          <ProductSearch />
        </Suspense>
      </div>

      {/* 分类筛选 */}
      <div className="mb-8">
        <Suspense fallback={<div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-8 w-20 animate-pulse rounded-full bg-surface-secondary" />))}</div>}>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {/* 结果信息 */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {search && <span>搜索 &quot;{search}&quot; - </span>}
          共 {total} 件商品
        </p>
      </div>

      {/* 商品网格 */}
      <ProductGrid products={products} />

      {/* 分页 */}
      <Suspense>
        <Pagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
