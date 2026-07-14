import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, MEMBERSHIP_TIERS } from "@/lib/constants";
import { PayButton } from "@/components/shop/PayButton";
import type { OrderStatusKey, MembershipTierKey } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/orders/${(await params).id}`);

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, image: true, price: true },
          },
        },
      },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  const status = ORDER_STATUS[order.status as OrderStatusKey];
  const tier = MEMBERSHIP_TIERS[order.membershipTier as MembershipTierKey];

  return (
    <div className="page-container py-8">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/orders" className="hover:text-primary">我的订单</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">订单详情</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">订单详情</h1>
          <p className="mt-1 text-sm text-text-muted">{order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge text-sm px-3 py-1 ${status?.color || ""}`}>
            {status?.label || order.status}
          </span>
          <PayButton orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {order.items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link href={`/products/${item.product.slug}`}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-text-muted">暂无</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <Link href={`/products/${item.product.slug}`}
                  className="font-medium text-text-primary hover:text-primary">
                  {item.product.name}
                </Link>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{formatPrice(item.price)} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="font-bold text-text-primary">订单信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">收货地址</span>
                <span className="text-right max-w-[60%]">{order.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">联系电话</span>
                <span>{order.phone}</span>
              </div>
              {order.note && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">备注</span>
                  <span>{order.note}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">下单时间</span>
                <span>{new Date(order.createdAt).toLocaleString("zh-CN")}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">支付时间</span>
                  <span>{new Date(order.paidAt).toLocaleString("zh-CN")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-bold text-text-primary">金额明细</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">商品总额</span>
                <span>{formatPrice(order.originalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    会员折扣（{tier?.label || order.membershipTier}）
                  </span>
                  <span className="text-success">−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <span className="font-bold">实付金额</span>
                <span className="font-bold text-danger">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
