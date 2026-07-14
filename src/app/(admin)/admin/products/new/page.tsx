"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary">新增商品</h1>
      <div className="mt-6">
        <ProductForm
          submitLabel="创建"
          onSubmit={async (data) => {
            const res = await fetch("/api/admin/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...data, images: "[]",
                comparePrice: data.comparePrice || undefined,
                image: data.image || undefined,
              }),
            });
            if (res.ok) { router.push("/admin/products"); return null; }
            const d = await res.json();
            return d.error || "创建失败";
          }}
        />
      </div>
    </div>
  );
}
