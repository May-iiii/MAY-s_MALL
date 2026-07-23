export default function ProductsLoading() {
  return (
    <div className="page-container py-8">
      {/* 搜索栏骨架 */}
      <div className="mb-6 h-10 w-full max-w-md animate-pulse rounded-lg bg-stone-200" />

      {/* 分类筛选骨架 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 animate-pulse rounded-full bg-stone-200"
          />
        ))}
      </div>

      {/* 商品卡片骨架 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
          >
            <div className="aspect-[4/3] animate-pulse bg-stone-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-12 animate-pulse rounded bg-stone-200" />
              <div className="h-5 w-full animate-pulse rounded bg-stone-200" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-stone-200" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-16 animate-pulse rounded bg-stone-200" />
                <div className="h-6 w-12 animate-pulse rounded bg-stone-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
