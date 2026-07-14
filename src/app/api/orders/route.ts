import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { calculateOrderAmount } from "@/lib/membership";

// GET /api/orders — 我的订单列表
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: orders.map((o) => ({
      ...o,
      itemCount: o._count.items,
    })),
  });
}

// POST /api/orders — 从购物车创建订单
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const address = String(body.address || "").trim();
    const phone = String(body.phone || "").trim();
    const note = body.note ? String(body.note).trim() : null;

    if (!address || !phone) {
      return NextResponse.json(
        { error: "请填写收货地址和联系电话" },
        { status: 400 },
      );
    }

    // 在事务中完成：读取购物车 → 校验库存 → 创建订单 → 扣库存 → 清购物车
    const order = await prisma.$transaction(async (tx) => {
      // 1. 获取购物车
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id },
        include: {
          product: {
            select: { id: true, price: true, stock: true, name: true },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new Error("购物车为空");
      }

      // 2. 校验库存
      const outOfStock: string[] = [];
      for (const item of cartItems) {
        if (item.quantity > item.product.stock) {
          outOfStock.push(
            `${item.product.name}（库存 ${item.product.stock}，需要 ${item.quantity}）`,
          );
        }
      }
      if (outOfStock.length > 0) {
        throw new Error(`库存不足：${outOfStock.join("；")}`);
      }

      // 3. 计算金额（含会员折扣）
      const { originalAmount, discountAmount, totalAmount } =
        calculateOrderAmount(
          cartItems.map((item) => ({
            price: item.product.price,
            quantity: item.quantity,
          })),
          user.membershipTier,
        );

      // 4. 创建订单
      const orderNumber = generateOrderNumber();
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          originalAmount,
          discountAmount,
          totalAmount,
          membershipTier: user.membershipTier,
          address,
          phone,
          note,
          userId: user.id,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // 5. 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 6. 清空购物车
      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return newOrder;
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建订单失败";
    // 事务内 throw 的业务错误返回 400
    const isBusinessError =
      message.startsWith("库存不足") || message === "购物车为空";
    return NextResponse.json(
      { error: message },
      { status: isBusinessError ? 400 : 500 },
    );
  }
}
