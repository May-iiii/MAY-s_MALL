import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, MEMBERSHIP_TIERS } from "@/lib/constants";
import type { OrderStatusKey, MembershipTierKey } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { DashboardCharts } from "@/components/admin/charts/DashboardCharts";
import {
  ProductsIcon,
  OrdersIcon,
  CategoriesIcon,
  RevenueIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@/components/admin/icons";

const STATUS_BADGE: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  PENDING: "warning",
  PAID: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const TREND_DAYS = 30;

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const trendSince = new Date();
  trendSince.setDate(trendSince.getDate() - (TREND_DAYS - 1));
  trendSince.setHours(0, 0, 0, 0);

  const [
    productCount,
    orderCount,
    userCount,
    recentOrders,
    trendOrders,
    statusGroups,
    tierGroups,
    categoriesWithCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: trendSince },
      },
      select: { createdAt: true, totalAmount: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.user.groupBy({ by: ["membershipTier"], _count: true }),
    prisma.category.findMany({
      select: { name: true, _count: { select: { products: true } } },
    }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
  });

  // 销售趋势：近 30 天按日汇总，空缺日补 0
  const revenueByDate = new Map<string, number>();
  for (const order of trendOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    revenueByDate.set(key, (revenueByDate.get(key) || 0) + order.totalAmount);
  }
  const salesTrend = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date(trendSince);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key.slice(5), amount: Math.round((revenueByDate.get(key) || 0) * 100) / 100 };
  });

  const statusDist = statusGroups.map((g) => ({
    label: ORDER_STATUS[g.status as OrderStatusKey]?.label || g.status,
    count: g._count,
  }));

  const tierDist = tierGroups.map((g) => ({
    label: MEMBERSHIP_TIERS[g.membershipTier as MembershipTierKey]?.label || g.membershipTier,
    count: g._count,
  }));

  const categoryCounts = categoriesWithCount.map((c) => ({
    name: c.name,
    count: c._count.products,
  }));

  const stats = [
    { label: "总销售额", value: formatPrice(totalRevenue._sum.totalAmount || 0), Icon: RevenueIcon, accent: "text-amber-600 bg-amber-50" },
    { label: "商品总数", value: productCount, Icon: ProductsIcon, accent: "text-stone-700 bg-stone-100" },
    { label: "订单总数", value: orderCount, Icon: OrdersIcon, accent: "text-stone-700 bg-stone-100" },
    { label: "用户总数", value: userCount, Icon: UsersIcon, accent: "text-stone-700 bg-stone-100" },
  ];

  const shortcuts = [
    { href: "/admin/products", title: "商品管理", desc: "上下架、编辑库存与价格", Icon: ProductsIcon },
    { href: "/admin/orders", title: "订单管理", desc: "查看订单、流转状态", Icon: OrdersIcon },
    { href: "/admin/categories", title: "分类管理", desc: "维护商品分类", Icon: CategoriesIcon },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">概览</h1>
        <p className="mt-1 text-sm text-stone-500">商城运营数据一览</p>
      </div>

      {/* 统计卡 */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {shortcuts.map(({ href, title, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-amber-50 group-hover:text-amber-600">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-stone-900">{title}</p>
              <p className="truncate text-sm text-stone-500">{desc}</p>
            </div>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-stone-300 transition-all group-hover:translate-x-0.5 group-hover:text-stone-500" />
          </Link>
        ))}
      </div>

      {/* 数据可视化 */}
      <DashboardCharts
        salesTrend={salesTrend}
        statusDist={statusDist}
        tierDist={tierDist}
        categoryCounts={categoryCounts}
      />

      {/* 最近订单 */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-900">最近订单</h2>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 transition-colors hover:text-amber-600"
        >
          查看全部
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-400">
              <th className="px-5 py-3 font-medium">订单号</th>
              <th className="px-5 py-3 font-medium">用户</th>
              <th className="px-5 py-3 text-right font-medium">金额</th>
              <th className="px-5 py-3 text-center font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recentOrders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-stone-50">
                <td className="px-5 py-3.5 font-mono text-xs text-stone-600">{order.orderNumber}</td>
                <td className="px-5 py-3.5 text-stone-700">{order.user.name}</td>
                <td className="px-5 py-3.5 text-right font-medium text-stone-900">{formatPrice(order.totalAmount)}</td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={STATUS_BADGE[order.status] || "default"}>
                    {ORDER_STATUS[order.status as OrderStatusKey]?.label || order.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-stone-400">暂无订单</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
