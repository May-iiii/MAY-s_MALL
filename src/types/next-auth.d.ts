import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      membershipTier: string;
      totalSpent: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    membershipTier?: string;
    totalSpent?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    membershipTier?: string;
    totalSpent?: number;
  }
}
