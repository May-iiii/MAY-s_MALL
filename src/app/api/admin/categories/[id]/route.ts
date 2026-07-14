import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!name) return NextResponse.json({ error: "请输入分类名称" }, { status: 400 });
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug: slugify(name), description: body.description || null, image: body.image || null },
    });
    return NextResponse.json({ category });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) return NextResponse.json({ error: `该分类下有 ${count} 件商品，无法删除` }, { status: 400 });
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
