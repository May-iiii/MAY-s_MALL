"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { MEMBERSHIP_TIERS, ROLES, type MembershipTierKey } from "@/lib/constants";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipTier: string;
  totalSpent: number;
  createdAt: string;
  _count: { orders: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items);
        setTotalPages(data.totalPages);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
    if (!confirm(`确定将角色切换为「${ROLES[newRole as keyof typeof ROLES]}」？`)) return;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
      );
    } else {
      alert("操作失败");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">用户管理</h1>
        <p className="mt-1 text-sm text-stone-500">查看用户、调整角色</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-400">
              <th className="px-5 py-3 text-left font-medium">用户</th>
              <th className="px-5 py-3 text-left font-medium">邮箱</th>
              <th className="px-5 py-3 text-center font-medium">角色</th>
              <th className="px-5 py-3 text-center font-medium">会员</th>
              <th className="px-5 py-3 text-right font-medium">消费</th>
              <th className="px-5 py-3 text-center font-medium">订单数</th>
              <th className="px-5 py-3 text-right font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => {
              const tierLabel =
                MEMBERSHIP_TIERS[u.membershipTier as MembershipTierKey]?.label ||
                u.membershipTier;
              return (
                <tr key={u.id} className="transition-colors hover:bg-stone-50">
                  <td className="px-5 py-3.5 font-medium text-stone-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-stone-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        u.role === "ADMIN"
                          ? "bg-stone-900 text-white hover:bg-stone-700"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {ROLES[u.role as keyof typeof ROLES] || u.role}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {tierLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-stone-700">
                    {formatPrice(u.totalSpent)}
                  </td>
                  <td className="px-5 py-3.5 text-center text-stone-700">{u._count.orders}</td>
                  <td className="px-5 py-3.5 text-right text-xs text-stone-400">
                    {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-stone-400">
                  暂无用户
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                page === i + 1
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
