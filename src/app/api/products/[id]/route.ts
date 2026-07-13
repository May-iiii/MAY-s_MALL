import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "无效的商品ID" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id, isPublished: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  return NextResponse.json(product);
}
