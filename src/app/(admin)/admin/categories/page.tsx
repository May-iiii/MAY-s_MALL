"use client";

import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.items);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("请输入分类名称");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      fetchCategories();
    } else {
      const d = await res.json();
      setError(d.error || "创建失败");
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`确定删除「${catName}」？`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    } else {
      const d = await res.json();
      alert(d.error || "删除失败");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">分类管理</h1>
        <p className="mt-1 text-sm text-stone-500">维护商品分类</p>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <label className="text-sm font-medium text-stone-700">名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1.5" placeholder="分类名称" required />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="text-sm font-medium text-stone-700">描述</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1.5" placeholder="可选" />
        </div>
        <button type="submit" className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700">
          添加
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-400">
              <th className="px-5 py-3 text-left font-medium">名称</th>
              <th className="px-5 py-3 text-left font-medium">Slug</th>
              <th className="px-5 py-3 text-center font-medium">商品数</th>
              <th className="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-stone-50">
                <td className="px-5 py-3.5 font-medium text-stone-900">{c.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-stone-500">{c.slug}</td>
                <td className="px-5 py-3.5 text-center text-stone-700">{c._count.products}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={c._count.products > 0}
                    className="btn-danger btn-sm disabled:opacity-30"
                    title={c._count.products > 0 ? "有商品时不能删除" : ""}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-stone-400">
                  暂无分类
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
