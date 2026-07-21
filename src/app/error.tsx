"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 生产环境可接入日志上报
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold text-text-muted">出错了</h1>
      <p className="text-text-secondary">页面加载失败，请稍后重试。</p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn-primary">
          重试
        </button>
        <Link href="/" className="btn-outline">
          返回首页
        </Link>
      </div>
    </div>
  );
}
