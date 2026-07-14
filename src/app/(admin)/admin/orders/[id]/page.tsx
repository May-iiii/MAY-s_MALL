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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">订单详情</h1>
          <p className="mt-1 text-sm text-text-muted">{order.orderNumber}</p>
        </div>
        <span className={`badge text-sm px-3 py-1 ${status?.color || ""}`}>
          {status?.label || order.status}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold">客户信息</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>{order.user.name}</p>
              <p className="text-text-muted">{order.user.email}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold">收货信息</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>地址：{order.address || "未填写"}</p>
              <p>电话：{order.phone || "未填写"}</p>
              {order.note ? <p>备注：{order.note}</p> : null}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold">金额明细</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">商品总额</span>
                <span>{formatPrice(order.originalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">会员折扣</span>
                  <span className="text-success">−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1 font-bold text-base">
                <span>实付</span>
                <span className="text-danger">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold">商品明细</h3>
          <div className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-surface-secondary">
                  {item.product.image ? (
                    <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-muted">暂无</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium hover:text-primary">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/orders" className="btn-outline btn-sm">← 返回订单列表</Link>
      </div>
    </div>
  );
}
