"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/SessionProvider";
import { normalizeSpecs } from "@/lib/utils";
import { notifyCartUpdated } from "@/components/layout/CartBadge";

type Spec = { name: string; options: string[] };

type Props = {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string | null;
  stock: number;
  specs: Spec[];
};

export function SpecSelectors({
  productId,
  productName,
  productPrice,
  productImage,
  stock,
  specs,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const allSelected =
    specs.length === 0 || specs.every((s) => selected[s.name]);

  const addToCart = useCallback(async () => {
    if (!allSelected) return;
    setLoading(true);
    setError("");

    if (user) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            quantity,
            specs: specs.length > 0 ? normalizeSpecs(selected) : undefined,
          }),
        });
        if (res.ok) {
          notifyCartUpdated();
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        } else if (res.status === 401) {
          router.push("/login");
        } else {
          const data = await res.json().catch(() => null);
          setError(data?.error || "操作失败，请稍后重试");
        }
      } finally {
        setLoading(false);
      }
    } else {
      // 未登录：localStorage
      let cart: Array<{
        productId: string;
        name: string;
        price: number;
        image: string | null;
        quantity: number;
        stock: number;
        specs?: string;
      }>;
      try {
        cart = JSON.parse(localStorage.getItem("may-cart") || "[]");
      } catch {
        cart = [];
      }
      const specsKey = specs.length > 0 ? normalizeSpecs(selected) : "{}";
      const existing = cart.find(
        (item) =>
          item.productId === productId && (item.specs || "{}") === specsKey,
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, stock);
      } else {
        cart.push({
          productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity,
          stock,
          specs: specsKey,
        });
      }
      localStorage.setItem("may-cart", JSON.stringify(cart));
      notifyCartUpdated();
      setLoading(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }, [user, productId, quantity, selected, specs, productName, productPrice, productImage, stock, allSelected, router]);

  // 立刻购买：不加购物车，暂存本次直购项后跳独立结算页
  const buyNow = useCallback(() => {
    if (!allSelected) return;
    const specsValue = specs.length > 0 ? normalizeSpecs(selected) : "{}";
    sessionStorage.setItem(
      "may-buynow",
      JSON.stringify({ productId, quantity, specs: specsValue }),
    );
    const target = "/checkout?mode=buynow";
    router.push(user ? target : `/login?callbackUrl=${encodeURIComponent(target)}`);
  }, [allSelected, specs, selected, productId, quantity, user, router]);

  const setSpec = (name: string, value: string) =>
    setSelected((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="space-y-4">
      {/* 规格选择器 */}
      {specs.map((s) => (
        <div key={s.name}>
          <p className="mb-2 text-sm font-medium text-stone-700">{s.name}</p>
          <div className="flex flex-wrap gap-2">
            {s.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSpec(s.name, opt)}
                className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  selected[s.name] === opt
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 数量选择器 */}
      <div>
        <p className="mb-2 text-sm font-medium text-stone-700">数量</p>
        <div className="flex items-center rounded-lg border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 text-text-secondary hover:bg-surface-secondary"
            disabled={stock <= 0}
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-4 py-2 text-text-secondary hover:bg-surface-secondary"
            disabled={stock <= 0}
          >
            +
          </button>
        </div>
      </div>

      {/* 按钮区 */}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          onClick={addToCart}
          disabled={stock <= 0 || !allSelected || loading}
          className="flex-1 rounded-xl bg-stone-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
        >
          {stock <= 0
            ? "暂时缺货"
            : !allSelected
            ? "请选择规格"
            : loading
            ? "..."
            : added
            ? "✓ 已添加"
            : "加入购物车"}
        </button>
        <button
          onClick={buyNow}
          disabled={stock <= 0 || !allSelected || loading}
          className="flex-1 rounded-xl bg-amber-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          立刻购买
        </button>
      </div>
    </div>
  );
}
