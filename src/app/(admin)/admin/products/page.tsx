"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Category = { id: string; name: string };
type Product = {
  id: string; name: string; slug: string; price: number; stock: number;
  isPublished: boolean; isFeatured: boolean; category: { name: string } | null; createdAt: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);

  const fetchProducts = async (p: number, s: string, cid: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (s) params.set("search", s);
    if (cid) params.set("categoryId", cid);
    try {
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.items);
        setTotalPages(data.totalPages);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(page, search, categoryId); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, search, categoryId);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除「${name}」？`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProducts(page, search, categoryId);
    } else {
      alert("删除失败，请重试");
    }
  };

  const handleToggle = async (id: string, field: "isPublished" | "isFeatured", value: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          // 下架时同步取消精选
          if (field === "isPublished" && !value) return { ...p, isPublished: false, isFeatured: false };
          return { ...p, [field]: value };
        }),
      );
    } else {
      alert("操作失败");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">商品管理</h1>
          <p className="mt-1 text-sm text-stone-500">管理商品、上下架与库存</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          新增商品
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索商品名称..." className="input-field max-w-xs" />
        <Button type="submit" variant="outline">搜索</Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => { setCategoryId(""); setPage(1); fetchProducts(1, search, ""); }}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${!categoryId ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}>
          全部分类
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => { setCategoryId(c.id); setPage(1); fetchProducts(1, search, c.id); }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${categoryId === c.id ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-400">
              <th className="px-5 py-3 text-left font-medium">名称</th>
              <th className="px-5 py-3 text-left font-medium">分类</th>
              <th className="px-5 py-3 text-right font-medium">价格</th>
              <th className="px-5 py-3 text-right font-medium">库存</th>
              <th className="px-5 py-3 text-center font-medium">状态</th>
              <th className="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-stone-50">
                <td className="px-5 py-3.5 font-medium text-stone-900">{p.name}</td>
                <td className="px-5 py-3.5 text-stone-500">{p.category?.name}</td>
                <td className="px-5 py-3.5 text-right text-stone-700">{formatPrice(p.price)}</td>
                <td className={`px-5 py-3.5 text-right ${p.stock === 0 ? "text-red-600" : "text-stone-700"}`}>{p.stock}</td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggle(p.id, "isPublished", !p.isPublished)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${p.isPublished ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-stone-100 text-stone-400 hover:bg-stone-200"}`}
                      title={p.isPublished ? "点击下架" : "点击上架"}
                    >
                      {p.isPublished ? "上架" : "草稿"}
                    </button>
                    <button
                      onClick={() => handleToggle(p.id, "isFeatured", !p.isFeatured)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${p.isFeatured ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-stone-50 text-stone-300 hover:bg-stone-100"}`}
                      title={p.isFeatured ? "取消精选" : "设为精选"}
                    >
                      {p.isFeatured ? "★" : "☆"}
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} className="btn-outline btn-sm">编辑</Link>
                    <button onClick={() => handleDelete(p.id, p.name)} className="btn-danger btn-sm">删除</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-stone-400">暂无商品</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${page === i + 1 ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
