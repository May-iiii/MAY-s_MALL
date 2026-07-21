import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { parseBody } from "@/lib/parse-body";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items: categories });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const parsed = await parseBody(request, categorySchema);
    if (!parsed.success) return parsed.response;
    const { name, description, image } = parsed.data;
    const category = await prisma.category.create({
      data: { name, slug: slugify(name), description: description || null, image: image || null },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
