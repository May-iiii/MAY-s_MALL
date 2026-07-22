"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const p = d.product;
        setInitial({
          name: p.name, description: p.description,
          price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : "",
          stock: String(p.stock), image: p.image || "",
          specs: p.specs || "",
          isFeatured: p.isFeatured, isPublished: p.isPublished, categoryId: p.categoryId,
        });
      })
      .catch(() => setError("加载商品信息失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl"><p className="text-text-muted py-20 text-center">加载中...</p></div>;
  if (error) return <div className="max-w-2xl"><p className="text-red-600 py-20 text-center">{error}</p></div>;
  if (!initial) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary">编辑商品</h1>
      <div className="mt-6">
        <ProductForm
          initialData={initial}
          submitLabel="保存"
          onSubmit={async (data) => {
            const res = await fetch(`/api/admin/products/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...data, images: "[]",
                comparePrice: data.comparePrice || undefined,
                image: data.image || undefined,
              }),
            });
            if (res.ok) { router.push("/admin/products"); return null; }
            const d = await res.json();
            return d.error || "保存失败";
          }}
        />
      </div>
    </div>
  );
}
