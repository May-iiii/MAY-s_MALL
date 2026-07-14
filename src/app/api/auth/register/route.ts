import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    // 校验
    if (!name || !email || !password) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 });
    }

    // 密码需包含字母和数字
    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "密码需包含字母和数字" },
        { status: 400 },
      );
    }

    // IP 限流：每分钟最多注册 3 次
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`register:${ip}`, 3, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "操作过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    // 检查邮箱唯一性（规范化后）
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    // 创建用户
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "CUSTOMER",
      },
    });

    // 注册后自动登录
    await setSession(user.id, user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipTier: user.membershipTier,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 },
    );
  }
}
