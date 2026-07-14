import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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
    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = body.price !== undefined && body.price !== null ? Number(body.price) : null;
    const categoryId = body.categoryId ? String(body.categoryId) : "";

    if (!name || !description || price === null || !categoryId) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    const product = await prisma.product.create({
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

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
