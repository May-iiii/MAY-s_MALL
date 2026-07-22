import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { calculateOrderAmount } from "@/lib/membership";
import { parseBody } from "@/lib/parse-body";
import { createOrderSchema } from "@/lib/validations";

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

  const parsed = await parseBody(request, createOrderSchema);
  if (!parsed.success) return parsed.response;
  const address = parsed.data.address.trim();
  const phone = parsed.data.phone.trim();
  const note = parsed.data.note?.trim() || null;
  const buyNow = parsed.data.buyNow;

  try {
    // 立刻购买：不读购物车、不清购物车，只结算这一件
    if (buyNow) {
      const order = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: buyNow.productId, isPublished: true },
          select: { id: true, price: true, stock: true, name: true },
        });

        if (!product) {
          throw new Error("商品不存在");
        }
        if (buyNow.quantity > product.stock) {
          throw new Error(
            `库存不足：${product.name}（库存 ${product.stock}，需要 ${buyNow.quantity}）`,
          );
        }

        const { originalAmount, discountAmount, totalAmount } =
          calculateOrderAmount(
            [{ price: product.price, quantity: buyNow.quantity }],
            user.membershipTier,
          );

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
              create: [
                {
                  productId: product.id,
                  quantity: buyNow.quantity,
                  price: product.price,
                  specs: buyNow.specs || "{}",
                },
              ],
            },
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: buyNow.quantity } },
        });

        return newOrder;
      });

      return NextResponse.json({ order });
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

      // 2. 校验库存（同一商品可能因规格不同拆成多行，需按 productId 汇总后再比较）
      const neededByProduct = new Map<string, { name: string; stock: number; quantity: number }>();
      for (const item of cartItems) {
        const entry = neededByProduct.get(item.productId);
        if (entry) {
          entry.quantity += item.quantity;
        } else {
          neededByProduct.set(item.productId, {
            name: item.product.name,
            stock: item.product.stock,
            quantity: item.quantity,
          });
        }
      }
      const outOfStock: string[] = [];
      for (const { name, stock, quantity } of neededByProduct.values()) {
        if (quantity > stock) {
          outOfStock.push(`${name}（库存 ${stock}，需要 ${quantity}）`);
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
              specs: item.specs,
            })),
          },
        },
      });

      // 5. 扣减库存（按 productId 汇总后扣减，避免同商品多规格行重复查询）
      for (const [productId, { quantity }] of neededByProduct) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
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
      message.startsWith("库存不足") ||
      message === "购物车为空" ||
      message === "商品不存在";
    return NextResponse.json(
      { error: message },
      { status: isBusinessError ? 400 : 500 },
    );
  }
}
