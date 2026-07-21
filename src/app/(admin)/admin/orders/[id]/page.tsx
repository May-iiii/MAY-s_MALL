import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import type { OrderStatusKey } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, image: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const status = ORDER_STATUS[order.status as OrderStatusKey];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">订单详情</h1>
          <p className="mt-1 font-mono text-sm text-stone-500">{order.orderNumber}</p>
        </div>
        <span className={`badge text-sm px-3 py-1 ${status?.color || ""}`}>
          {status?.label || order.status}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-stone-900">客户信息</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-stone-700">{order.user.name}</p>
              <p className="text-stone-500">{order.user.email}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-stone-900">收货信息</h3>
            <div className="mt-2 space-y-1 text-sm text-stone-700">
              <p>地址：{order.address || "未填写"}</p>
              <p>电话：{order.phone || "未填写"}</p>
              {order.note ? <p>备注：{order.note}</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-stone-900">金额明细</h3>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">商品总额</span>
                <span className="text-stone-700">{formatPrice(order.originalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-500">会员折扣</span>
                  <span className="text-emerald-600">−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold">
                <span className="text-stone-900">实付</span>
                <span className="text-amber-700">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-stone-900">商品明细</h3>
          <div className="mt-3 divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {item.product.image ? (
                    <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">暂无</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-stone-800 hover:text-amber-600">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-stone-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-amber-600">← 返回订单列表</Link>
      </div>
    </div>
  );
}
