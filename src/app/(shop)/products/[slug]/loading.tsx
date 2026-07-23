export default function ProductDetailLoading() {
  return (
    <div className="page-container py-8">
      {/* 面包屑骨架 */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-10 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-12 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 图片骨架 */}
        <div className="space-y-4">
          <div className="aspect-square animate-pulse rounded-xl bg-stone-200" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-lg bg-stone-200" />
            ))}
          </div>
        </div>

        {/* 信息骨架 */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-stone-200" />
            <div className="h-6 w-12 animate-pulse rounded-full bg-stone-200" />
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200" />
          <div className="flex gap-3">
            <div className="h-9 w-28 animate-pulse rounded bg-stone-200" />
            <div className="h-6 w-20 animate-pulse rounded bg-stone-200" />
          </div>
          <div className="space-y-2 border-t border-stone-100 pt-6">
            <div className="h-4 w-full animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-5 w-16 animate-pulse rounded bg-stone-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />
          </div>
          <div className="pt-6">
            <div className="h-12 w-full animate-pulse rounded-xl bg-stone-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
