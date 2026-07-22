"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipTier: string;
  totalSpent: number;
  createdAt?: string;
} | null;

type AuthContextValue = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // 初始化时检查登录状态
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // 登录/注册成功后，将游客期写入 localStorage 的购物车合并到服务端
  const mergeGuestCart = useCallback(async () => {
    let guestCart: Array<{ productId: string; quantity: number; specs?: string }>;
    try {
      guestCart = JSON.parse(localStorage.getItem("may-cart") || "[]");
    } catch {
      guestCart = [];
    }
    if (!Array.isArray(guestCart) || guestCart.length === 0) return;

    try {
      // POST /api/cart 已是 upsert/increment，逐项合并即可
      for (const item of guestCart) {
        if (!item?.productId || !item?.quantity) continue;
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            specs: item.specs || "{}",
          }),
        });
      }
      localStorage.removeItem("may-cart");
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      // 合并失败不阻断登录，保留 localStorage 待下次
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          await mergeGuestCart();
          return {};
        }
        return { error: data.error || "登录失败" };
      } catch {
        return { error: "网络错误，请稍后重试" };
      }
    },
    [mergeGuestCart],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          await mergeGuestCart();
          return {};
        }
        return { error: data.error || "注册失败" };
      } catch {
        return { error: "网络错误，请稍后重试" };
      }
    },
    [mergeGuestCart],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new Event("cart-updated"));
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within SessionProvider");
  return ctx;
}
