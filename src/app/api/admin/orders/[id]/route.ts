import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, price: true, image: true } } } },
      },
    });
    if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    return NextResponse.json({ order });
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
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "无效的订单状态" }, { status: 400 });
    }

    // 先查当前状态，校验流转合法性
    const current = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!current) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

    const allowed = STATUS_FLOW[current.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `不允许从 ${current.status} 变更为 ${status}` },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({ where: { id }, data: { status } });
    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "无权限" }, { status: 403 });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
