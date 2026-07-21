export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3 text-stone-400">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-amber-600" />
        <p className="text-sm">加载中…</p>
      </div>
    </div>
  );
}
