"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import type { OrderStatusKey } from "@/lib/constants";

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

type Order = {
  id: string; orderNumber: string; status: string; totalAmount: number;
  createdAt: string; user: { name: string; email: string }; _count: { items: number };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (p: number, f: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (f) params.set("status", f);
    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.items);
        setTotalPages(data.totalPages);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(page, filter); }, [page, filter]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrders(page, filter);
    } else {
      alert("操作失败，请重试");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">订单管理</h1>
        <p className="mt-1 text-sm text-stone-500">查看订单并流转状态</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${filter === s ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}>
            {s ? ORDER_STATUS[s as OrderStatusKey]?.label || s : "全部"}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-400">
              <th className="px-5 py-3 text-left font-medium">订单号</th>
              <th className="px-5 py-3 text-left font-medium">用户</th>
              <th className="px-5 py-3 text-center font-medium">数量</th>
              <th className="px-5 py-3 text-right font-medium">金额</th>
              <th className="px-5 py-3 text-center font-medium">状态</th>
              <th className="px-5 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((o) => {
              const nextStatuses = STATUS_FLOW[o.status] || [];
              return (
                <tr key={o.id} className="transition-colors hover:bg-stone-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-stone-700 hover:text-amber-600">{o.orderNumber}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-stone-500">{o.user.name}</td>
                  <td className="px-5 py-3.5 text-center text-stone-700">{o._count.items}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-stone-900">{formatPrice(o.totalAmount)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={o.status === "PAID" ? "success" : o.status === "CANCELLED" ? "danger" : "info"}>
                      {ORDER_STATUS[o.status as OrderStatusKey]?.label || o.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {nextStatuses.length === 0 && <span className="text-xs text-stone-300">—</span>}
                      {nextStatuses.map((ns) => (
                        <button key={ns} onClick={() => updateStatus(o.id, ns)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${ns === "CANCELLED" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-stone-100 text-stone-700 hover:bg-amber-50 hover:text-amber-700"}`}>
                          {ORDER_STATUS[ns as OrderStatusKey]?.label || ns}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-stone-400">暂无订单</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${page === i + 1 ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
