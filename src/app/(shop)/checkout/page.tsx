"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/SessionProvider";
import { formatPrice, formatSpecsDisplay } from "@/lib/utils";
import { getMembershipDiscount } from "@/lib/membership";
import { Button } from "@/components/ui/Button";

type CartItem = {
  id: string;
  quantity: number;
  specs?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
};

type BuyNowPayload = { productId: string; quantity: number; specs: string };

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";

  const [items, setItems] = useState<CartItem[]>([]);
  const [buyNowPayload, setBuyNowPayload] = useState<BuyNowPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      const callback = isBuyNow ? "/checkout?mode=buynow" : "/checkout";
      router.push(`/login?callbackUrl=${encodeURIComponent(callback)}`);
    }
  }, [user, authLoading, router, isBuyNow]);

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

  const fetchBuyNowItem = useCallback(async () => {
    setLoading(true);
    try {
      const raw = sessionStorage.getItem("may-buynow");
      if (!raw) {
        setError("直购信息已失效，请重新选择商品");
        setItems([]);
        return;
      }
      const payload = JSON.parse(raw) as BuyNowPayload;
      const res = await fetch(`/api/products/${payload.productId}`);
      if (!res.ok) {
        setError("商品不存在或已下架");
        setItems([]);
        return;
      }
      const product = await res.json();
      setBuyNowPayload(payload);
      setItems([
        {
          id: "buynow",
          quantity: payload.quantity,
          specs: payload.specs,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.image,
            stock: product.stock,
          },
        },
      ]);
    } catch {
      setError("加载直购商品失败");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (isBuyNow) {
      fetchBuyNowItem();
    } else {
      fetchCart();
    }
  }, [user, isBuyNow, fetchCart, fetchBuyNowItem]);

  const validateForm = (): boolean => {
    let valid = true;
    setAddressError("");
    setPhoneError("");
    if (!address.trim() || address.trim().length < 5) {
      setAddressError("请输入完整的收货地址（至少5个字）");
      valid = false;
    }
    if (!phone.trim()) {
      setPhoneError("请输入联系电话");
      valid = false;
    } else if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setPhoneError("请输入有效的手机号");
      valid = false;
    }
    return valid;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    if (isBuyNow && !buyNowPayload) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          phone,
          note: note || undefined,
          buyNow: isBuyNow ? buyNowPayload : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isBuyNow) sessionStorage.removeItem("may-buynow");
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
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        {!isBuyNow && (
          <>
            <Link href="/cart" className="hover:text-primary">购物车</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-text-primary">结算</span>
      </nav>

      <h1 className="text-2xl font-bold text-text-primary">结算</h1>

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
          <p className="text-lg">{isBuyNow ? "直购信息不存在" : "购物车是空的"}</p>
          <Link href="/products" className="btn-primary mt-4">
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* 商品列表（只读） */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="card flex gap-4 p-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name}
                      className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-muted">暂无</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{item.product.name}</p>
                    {item.specs && item.specs !== "{}" && (
                      <p className="mt-0.5 text-xs text-stone-400">{formatSpecsDisplay(item.specs)}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{formatPrice(item.product.price)} × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 收货信息 + 汇总 + 提交 */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">收货信息</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setAddressError(""); }}
                    placeholder="收货地址"
                    className={`input-field ${addressError ? "border-red-400 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {addressError && <p className="mt-1 text-xs text-red-500">{addressError}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                    placeholder="手机号"
                    className={`input-field ${phoneError ? "border-red-400 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="备注（选填）"
                  className="input-field"
                />
              </div>

              <div className="space-y-2 border-t border-border pt-4 text-sm">
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
