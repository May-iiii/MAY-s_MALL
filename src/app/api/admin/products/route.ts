import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { parseBody } from "@/lib/parse-body";
import { productSchema } from "@/lib/validations";

// GET — 商品列表
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 10;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ items: products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

// POST — 创建商品
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const parsed = await parseBody(request, productSchema);
    if (!parsed.success) return parsed.response;
    const d = parsed.data;

    const product = await prisma.product.create({
      data: {
        name: d.name,
        slug: slugify(d.name),
        description: d.description,
        price: d.price,
        comparePrice: d.comparePrice ?? null,
        stock: d.stock,
        image: d.image || null,
        images: d.images || "[]",
        specs: d.specs || "",
        isFeatured: d.isFeatured,
        isPublished: d.isPublished,
        categoryId: d.categoryId,
      },
      include: { category: { select: { name: true } } },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
