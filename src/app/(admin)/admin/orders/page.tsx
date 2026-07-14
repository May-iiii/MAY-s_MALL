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
    <div>
      <h1 className="text-2xl font-bold text-text-primary">订单管理</h1>

      <div className="mt-4 flex gap-2">
        {["", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s ? "bg-primary text-white" : "bg-surface-secondary text-text-secondary hover:bg-surface"}`}>
            {s ? ORDER_STATUS[s as OrderStatusKey]?.label || s : "全部"}
          </button>
        ))}
      </div>

      <div className="mt-6 card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium">订单号</th>
              <th className="px-4 py-3 text-left font-medium">用户</th>
              <th className="px-4 py-3 text-center font-medium">数量</th>
              <th className="px-4 py-3 text-right font-medium">金额</th>
              <th className="px-4 py-3 text-center font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => {
              const nextStatuses = STATUS_FLOW[o.status] || [];
              return (
                <tr key={o.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-primary">{o.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{o.user.name}</td>
                  <td className="px-4 py-3 text-center">{o._count.items}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(o.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={o.status === "PAID" ? "success" : o.status === "CANCELLED" ? "danger" : "info"}>
                      {ORDER_STATUS[o.status as OrderStatusKey]?.label || o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {nextStatuses.map((ns) => (
                      <button key={ns} onClick={() => updateStatus(o.id, ns)}
                        className={`btn-sm rounded mr-1 ${ns === "CANCELLED" ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                        {ORDER_STATUS[ns as OrderStatusKey]?.label || ns}
                      </button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`rounded px-3 py-1 text-sm ${page === i + 1 ? "bg-primary text-white" : "hover:bg-surface-secondary"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
