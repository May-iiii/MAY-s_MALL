import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-secondary px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary">MAY{"'"}s Mall</h1>
        <p className="mt-3 text-lg text-text-secondary">您的精品购物平台</p>
      </div>
      <div className="flex gap-4">
        <Link href="/products" className="btn-primary">
          浏览商品
        </Link>
        <Link href="/admin/dashboard" className="btn-outline">
          后台管理
        </Link>
      </div>
    </div>
  );
}
