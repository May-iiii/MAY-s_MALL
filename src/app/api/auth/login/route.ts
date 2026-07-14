import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || "").toLowerCase().trim();
    const { password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }

    // IP + 邮箱双维度限流：每分钟最多 5 次尝试
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`login:${ip}:${email}`, 5, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "操作过于频繁，请稍后再试" },
        { status: 429 },
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        membershipTier: true,
        password: true,
      },
    });

    // 不区分用户不存在 vs 密码错误，防止撞库攻击
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 },
      );
    }

    // 写入 session
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
      { error: "登录失败，请稍后重试" },
      { status: 500 },
    );
  }
}
