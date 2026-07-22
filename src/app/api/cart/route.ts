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
          specs: true,
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
    const specs = (typeof body.specs === "string" ? body.specs : "{}") || "{}";

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

    // 检查同规格现有购物车项
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId_specs: { userId: user.id, productId, specs } },
    });

    const newQuantity = existing ? existing.quantity + quantity : quantity;

    // 库存是商品级共享的：同一商品可能因规格不同拆成多行，需汇总该商品所有规格行的数量再比较
    const sameProductItems = await prisma.cartItem.findMany({
      where: { userId: user.id, productId },
      select: { specs: true, quantity: true },
    });
    const otherSpecsQuantity = sameProductItems
      .filter((i) => i.specs !== specs)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (otherSpecsQuantity + newQuantity > product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${product.stock} 件` },
        { status: 400 },
      );
    }

    // upsert
    const cartItem = await prisma.cartItem.upsert({
      where: { userId_productId_specs: { userId: user.id, productId, specs } },
      create: { userId: user.id, productId, quantity, specs },
      update: { quantity: newQuantity },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, image: true, stock: true, specs: true },
        },
      },
    });

    return NextResponse.json({ item: cartItem });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
