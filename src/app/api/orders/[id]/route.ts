import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkTierUpgrade } from "@/lib/membership";

// GET /api/orders/[id] — 订单详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

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

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

// PUT /api/orders/[id] — 模拟支付（PENDING → PAID）
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "当前订单状态不可支付" },
        { status: 400 },
      );
    }

    // 支付：更新订单状态 → 累加消费金额 → 检查会员升级
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const paid = await tx.order.update({
        where: { id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // 累加消费金额
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          totalSpent: { increment: order.totalAmount },
        },
      });

      // 检查会员升级
      const newTier = checkTierUpgrade(
        updatedUser.totalSpent,
        updatedUser.membershipTier,
      );
      if (newTier !== updatedUser.membershipTier) {
        await tx.user.update({
          where: { id: user.id },
          data: { membershipTier: newTier },
        });
      }

      return paid;
    });

    return NextResponse.json({ order: updatedOrder });
  } catch {
    return NextResponse.json({ error: "支付失败" }, { status: 500 });
  }
}
