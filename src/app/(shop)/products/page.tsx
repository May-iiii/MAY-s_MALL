import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductSearch } from "@/components/shop/ProductSearch";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { Pagination } from "@/components/ui/Pagination";
import ProductsLoading from "./loading";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "全部商品",
};

type SearchParams = {
  search?: string;
  category?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

async function ProductsContent({ searchParams: sp }: { searchParams: SearchParams }) {
  const search = sp.search || "";
  const category = sp.category || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10));

  const [{ items: products, total, totalPages }, categories] = await Promise.all([
    getProducts({ search, category, page, pageSize: 9 }),
    getCategories(),
  ]);

  return (
    <>
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
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  // 用 key 强制 Suspense 在切换分类/搜索时显示 loading fallback
  const suspenseKey = `products-${params.search || ""}-${params.category || ""}-${params.page || "1"}`;

  return (
    <div className="page-container py-8">
      <Suspense key={suspenseKey} fallback={<ProductsLoading />}>
        <ProductsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
