import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { parseBody } from "@/lib/parse-body";
import { categorySchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsed = await parseBody(request, categorySchema);
    if (!parsed.success) return parsed.response;
    const { name, description, image } = parsed.data;
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug: slugify(name), description: description || null, image: image || null },
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
