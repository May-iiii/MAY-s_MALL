import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const [productCount, orderCount, userCount, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">概览</h1>

      {/* 快捷入口 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a href="/admin/products" className="card flex items-center gap-4 py-5 transition-shadow hover:shadow-md">
          <span className="text-3xl">📦</span>
          <div>
            <p className="font-bold text-text-primary">商品管理</p>
            <p className="text-sm text-text-muted">管理商品、上下架、库存</p>
          </div>
        </a>
        <a href="/admin/orders" className="card flex items-center gap-4 py-5 transition-shadow hover:shadow-md">
          <span className="text-3xl">📋</span>
          <div>
            <p className="font-bold text-text-primary">订单管理</p>
            <p className="text-sm text-text-muted">查看订单、修改状态</p>
          </div>
        </a>
        <a href="/admin/categories" className="card flex items-center gap-4 py-5 transition-shadow hover:shadow-md">
          <span className="text-3xl">🏷️</span>
          <div>
            <p className="font-bold text-text-primary">分类管理</p>
            <p className="text-sm text-text-muted">管理商品分类</p>
          </div>
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-text-muted">商品总数</p>
          <p className="mt-2 text-3xl font-bold">{productCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-muted">订单总数</p>
          <p className="mt-2 text-3xl font-bold">{orderCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-muted">用户总数</p>
          <p className="mt-2 text-3xl font-bold">{userCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-muted">总销售额</p>
          <p className="mt-2 text-3xl font-bold text-success">
            {formatPrice(totalRevenue._sum.totalAmount || 0)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-text-primary">最近订单</h2>
      <div className="mt-4 card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium">订单号</th>
              <th className="px-4 py-3 text-left font-medium">用户</th>
              <th className="px-4 py-3 text-left font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-secondary/50">
                <td className="px-4 py-3">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.user.name}</td>
                <td className="px-4 py-3">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
