"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/";
  // 仅允许相对路径，防止开放重定向钓鱼
  const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-text-primary">登录</h1>
        <p className="mt-2 text-center text-sm text-text-muted">
          登录您的 MAY&apos;s Mall 账号
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入邮箱"
            autoComplete="email"
          />

          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          还没有账号？{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
