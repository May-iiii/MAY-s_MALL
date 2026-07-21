import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseBody } from "@/lib/parse-body";
import { reviewSchema } from "@/lib/validations";

// POST /api/products/[id]/reviews — 提交商品评价
// 条件：登录 + 该用户有含此商品的已送达订单 + 未评价过
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id: productId } = await params;

  const parsed = await parseBody(request, reviewSchema);
  if (!parsed.success) return parsed.response;
  const { rating, content } = parsed.data;

  // 校验商品存在
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  // 校验：该用户是否有已送达订单包含此商品
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: user.id, status: "DELIVERED" },
    },
    select: { id: true },
  });
  if (!purchased) {
    return NextResponse.json(
      { error: "只有购买并收货后才能评价" },
      { status: 403 },
    );
  }

  // 校验：是否已评价（依赖 @@unique([userId, productId])）
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "您已评价过该商品" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      rating,
      content: content || null,
      userId: user.id,
      productId,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ review }, { status: 201 });
}
