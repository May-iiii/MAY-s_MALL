export default function Loading() {
  return (
    <div className="page-container flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3 text-text-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm">加载中…</p>
      </div>
    </div>
  );
}
