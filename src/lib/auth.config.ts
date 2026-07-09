import type { NextAuthConfig } from "next-auth";

// 为 proxy.ts（middleware）提取的配置，不含 Prisma adapter
// middleware 运行在 Edge Runtime，不能直接 import Prisma
export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/cart") ||
        nextUrl.pathname.startsWith("/checkout") ||
        nextUrl.pathname.startsWith("/orders") ||
        nextUrl.pathname.startsWith("/api/cart") ||
        nextUrl.pathname.startsWith("/api/orders");

      // 后台仅管理员
      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        return auth.user.role === "ADMIN";
      }

      // 受保护路由需登录
      if (isProtectedRoute) {
        if (!isLoggedIn) return false;
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
