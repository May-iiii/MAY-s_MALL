"use client";

import { useAuth } from "@/providers/SessionProvider";
import { NavLink } from "./NavLink";

export function UserMenu() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <span className="text-sm text-text-muted">...</span>;
  }

  if (!user) {
    return <NavLink href="/login">登录</NavLink>;
  }

  return (
    <div className="flex items-center gap-4">
      {user.role === "ADMIN" && (
        <NavLink href="/admin">后台</NavLink>
      )}
      <NavLink href="/orders" activeMatch="/orders">
        我的订单
      </NavLink>
      <span className="text-sm font-medium text-text-primary">
        {user.name}
      </span>
      <button
        onClick={() => logout()}
        className="text-sm text-text-muted hover:text-danger transition-colors"
      >
        退出
      </button>
    </div>
  );
}
