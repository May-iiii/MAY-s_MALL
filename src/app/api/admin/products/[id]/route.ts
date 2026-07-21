import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id }, include: { category: { select: { id: true, name: true } } } });
    if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = body.price !== undefined && body.price !== null ? Number(body.price) : null;
    const categoryId = body.categoryId ? String(body.categoryId) : "";

    if (!name || !description || price === null || !categoryId) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, slug: slugify(name), description, price,
        comparePrice: body.comparePrice ? Number(body.comparePrice) : null,
        stock: Number(body.stock || 0),
        image: body.image || null,
        images: body.images || "[]",
        isFeatured: !!body.isFeatured,
        isPublished: !!body.isPublished,
        categoryId,
      },
      include: { category: { select: { name: true } } },
    });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// PATCH — 快速切换上下架/精选状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, boolean> = {};
    if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;
    if (typeof body.isFeatured === "boolean") data.isFeatured = body.isFeatured;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "无有效字段" }, { status: 400 });
    }
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
