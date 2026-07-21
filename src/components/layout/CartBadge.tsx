"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/SessionProvider";

// 加购/合并/改量后派发此事件，角标即时刷新
export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}

export function CartBadge() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (user) {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          const items: Array<{ quantity: number }> = data.items || [];
          setCount(items.reduce((s, i) => s + i.quantity, 0));
          return;
        }
      } catch {
        // 忽略，回退到 0
      }
      setCount(0);
    } else {
      try {
        const cart: Array<{ quantity: number }> = JSON.parse(
          localStorage.getItem("may-cart") || "[]",
        );
        setCount(
          Array.isArray(cart) ? cart.reduce((s, i) => s + (i.quantity || 0), 0) : 0,
        );
      } catch {
        setCount(0);
      }
    }
  }, [user]);

  // 登录态变化、路由切换、加购事件时刷新
  useEffect(() => {
    if (isLoading) return;
    refresh();
  }, [isLoading, refresh, pathname]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("cart-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const isActive = pathname === "/cart";

  return (
    <Link
      href="/cart"
      className={`relative text-sm font-medium transition-colors hover:text-primary ${
        isActive ? "text-primary" : "text-text-secondary"
      }`}
    >
      购物车
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
