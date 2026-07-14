import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/cart — 获取当前用户购物车
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          image: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: cartItems });
}

// POST /api/cart — 加入购物车
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = body.productId as string;
    const quantity = Math.max(1, parseInt(String(body.quantity || "1"), 10));

    if (!productId) {
      return NextResponse.json({ error: "请提供商品ID" }, { status: 400 });
    }

    // 验证商品存在且有库存
    const product = await prisma.product.findUnique({
      where: { id: productId, isPublished: true },
      select: { id: true, stock: true },
    });

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 检查现有购物车项
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    const newQuantity = existing ? existing.quantity + quantity : quantity;

    if (newQuantity > product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${product.stock} 件` },
        { status: 400 },
      );
    }

    // upsert
    const cartItem = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId, quantity },
      update: { quantity: newQuantity },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, image: true, stock: true },
        },
      },
    });

    return NextResponse.json({ item: cartItem });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
