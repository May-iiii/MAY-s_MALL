import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import type { OrderStatusKey } from "@/lib/constants";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-text-primary">我的订单</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <svg className="mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg">还没有订单</p>
          <Link href="/products" className="btn-primary mt-4">去逛逛</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const status = ORDER_STATUS[order.status as OrderStatusKey];
            return (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-muted">订单号：{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-text-secondary">{order._count.items} 件商品</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${status?.color || ""}`}>
                    {status?.label || order.status}
                  </span>
                  <span className="text-lg font-semibold">{formatPrice(order.totalAmount)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
