"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-4xl font-bold text-stone-400">应用出错了</h1>
        <p className="text-stone-600">发生了意外错误，请刷新页面。</p>
        <button
          onClick={reset}
          className="mt-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          刷新
        </button>
      </body>
    </html>
  );
}
