"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

type Category = { id: string; name: string };
type ProductData = {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  image: string;
  specs: string;
  isFeatured: boolean;
  isPublished: boolean;
  categoryId: string;
};

type Props = {
  initialData?: Partial<ProductData>;
  onSubmit: (data: ProductData) => Promise<string | null>;
  submitLabel: string;
};

const defaults: ProductData = {
  name: "", description: "", price: "", comparePrice: "", stock: "0",
  image: "", specs: "", isFeatured: false, isPublished: true, categoryId: "",
};

export function ProductForm({ initialData, onSubmit, submitLabel }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductData>({ ...defaults, ...initialData });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((d) => setCategories(d.items || []))
      .catch(() => setError("加载分类失败"));
  }, []);

  const set = (key: keyof ProductData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        set("image", data.url);
      } else {
        setError(data.error || "上传失败");
      }
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.description || !form.price || !form.categoryId) {
      setError("请填写必填字段");
      return;
    }
    setLoading(true);
    const err = await onSubmit(form);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">名称 *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input-field mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">分类 *</label>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="input-field mt-1" required>
            <option value="">请选择</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">价格 *</label>
          <input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className="input-field mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">划线价</label>
          <input type="number" step="0.01" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">库存</label>
          <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="input-field mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">商品图片</label>
          <div className="mt-1 flex items-start gap-3">
            {form.image ? (
              <img
                src={form.image}
                alt="预览"
                className="h-16 w-16 flex-shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xs text-text-muted">
                无图
              </div>
            )}
            <div className="flex-1 space-y-2">
              <input
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                className="input-field"
                placeholder="图片 URL 或点击下方上传"
              />
              <div className="flex items-center gap-3">
                <label className="cursor-pointer rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200">
                  {uploading ? "上传中…" : "上传图片"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-xs text-text-muted">JPG/PNG/WebP/GIF，≤5MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">商品规格</label>
        <textarea
          value={form.specs}
          onChange={(e) => set("specs", e.target.value)}
          className="input-field mt-1"
          rows={3}
          placeholder={`颜色:黑色,白色&#10;尺码:S,M,L&#10;格式: 名称:选项1,选项2`}
        />
        <p className="mt-1 text-xs text-text-muted">每行一个规格：名称:选项1,选项2。留空表示无规格。</p>
      </div>
      <div>
        <label className="text-sm font-medium">描述 *</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="input-field mt-1" rows={3} required />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} /> 上架
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> 精选
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "..." : submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>取消</Button>
      </div>
    </form>
  );
}
