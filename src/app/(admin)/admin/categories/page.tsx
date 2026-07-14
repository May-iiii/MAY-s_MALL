"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

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
    <div>
      <h1 className="text-2xl font-bold text-text-primary">分类管理</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="mt-6 card flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium">名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1" placeholder="分类名称" required />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium">描述</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1" placeholder="可选" />
        </div>
        <Button type="submit">添加</Button>
      </form>

      <div className="mt-6 card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-center font-medium">商品数</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-surface-secondary/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-text-muted">{c.slug}</td>
                <td className="px-4 py-3 text-center">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
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
                <td colSpan={4} className="px-4 py-12 text-center text-text-muted">
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
