import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

// GET — 用户列表
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 12;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          membershipTier: true,
          totalSpent: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      items: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized")
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

const updateRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN"]),
});

// PATCH — 切换角色
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }
    const { id, role } = body as { id: string; role: string };
    if (!id) {
      return NextResponse.json({ error: "缺少用户 ID" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return NextResponse.json({ user: { id: user.id, role: user.role } });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized")
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
