import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/cart/[id] — 修改数量
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    if (body.quantity === undefined || body.quantity === null) {
      return NextResponse.json({ error: "请提供数量" }, { status: 400 });
    }

    const quantity = parseInt(String(body.quantity), 10);

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json({ error: "数量必须为正整数" }, { status: 400 });
    }

    // 验证购物车项属于当前用户
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: { select: { stock: true } } },
    });

    if (!cartItem || cartItem.userId !== user.id) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${cartItem.product.stock} 件` },
        { status: 400 },
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, image: true, stock: true },
        },
      },
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

// DELETE /api/cart/[id] — 删除某项
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  // 验证购物车项属于当前用户
  const cartItem = await prisma.cartItem.findUnique({ where: { id } });

  if (!cartItem || cartItem.userId !== user.id) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
