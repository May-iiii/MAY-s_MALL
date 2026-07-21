import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "参数校验失败";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const name = parsed.data.name.trim();
    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

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
