import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-text-muted">404</h1>
      <p className="text-lg text-text-secondary">页面不存在</p>
      <Link href="/" className="btn-primary">
        返回首页
      </Link>
    </div>
  );
}
