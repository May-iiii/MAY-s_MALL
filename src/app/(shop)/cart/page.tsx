"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/SessionProvider";
import { formatPrice } from "@/lib/utils";
import { getMembershipDiscount } from "@/lib/membership";
import { Button } from "@/components/ui/Button";
import { notifyCartUpdated } from "@/components/layout/CartBadge";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
};

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/cart");
    }
  }, [user, authLoading, router]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch {
      setError("加载购物车失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      );
      notifyCartUpdated();
    } else {
      const data = await res.json();
      setError(data.error || "操作失败");
    }
  };

  const removeItem = async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      notifyCartUpdated();
    }
  };

  const handleSubmitOrder = async () => {
    if (!address.trim() || !phone.trim()) {
      setError("请填写收货地址和联系电话");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, phone, note: note || undefined }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/orders/${data.order.id}`);
      } else {
        setError(data.error || "提交订单失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const originalAmount = items.reduce(
    (sum, item) =>
      sum + item.product.price * Math.min(item.quantity, item.product.stock),
    0,
  );
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // 会员折扣：口径与 lib/membership.ts 的 calculateOrderAmount 保持一致
  const discountRate = getMembershipDiscount(user?.membershipTier ?? "FREE");
  const payAmount =
    Math.round(originalAmount * (1 - discountRate) * 100) / 100;
  const discountAmount = Math.round((originalAmount - payAmount) * 100) / 100;

  if (authLoading || loading) {
    return (
      <div className="page-container py-8">
        <div className="flex justify-center py-20">
          <p className="text-text-muted">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-text-primary">购物车</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">
            关闭
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <svg className="mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-lg">购物车是空的</p>
          <Link href="/products" className="btn-primary mt-4">
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* 商品列表 */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="card flex gap-4 p-4">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-secondary"
                >
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name}
                      className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-muted">暂无</div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/products/${item.product.slug}`}
                      className="font-medium text-text-primary hover:text-primary">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-danger">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-border">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 text-text-secondary hover:bg-surface-secondary disabled:opacity-30">−</button>
                      <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1 text-text-secondary hover:bg-surface-secondary disabled:opacity-30">+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      <button onClick={() => removeItem(item.id)}
                        className="text-xs text-text-muted hover:text-danger">删除</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 汇总 + 下单 */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">订单摘要</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">商品数量</span>
                  <span className="text-text-primary">{totalCount} 件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">商品总额</span>
                  <span className="text-text-primary">{formatPrice(originalAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">会员折扣</span>
                    <span className="text-success">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* 收货信息 */}
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-medium text-text-primary">收货信息</p>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="收货地址"
                  className="input-field"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="联系电话"
                  className="input-field"
                />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="备注（选填）"
                  className="input-field"
                />
              </div>

              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-lg font-bold text-text-primary">合计</span>
                <span className="text-lg font-bold text-danger">{formatPrice(payAmount)}</span>
              </div>

              <Button onClick={handleSubmitOrder} disabled={submitting} className="w-full" size="lg">
                {submitting ? "提交中..." : "提交订单"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
