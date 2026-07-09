// 前台共享类型

import type { MEMBERSHIP_TIERS, ORDER_STATUS } from "@/lib/constants";

export type MembershipTierKey = keyof typeof MEMBERSHIP_TIERS;
export type OrderStatusKey = keyof typeof ORDER_STATUS;

export type UserSession = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  membershipTier: MembershipTierKey;
  totalSpent: number;
} | null;

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  image: string | null;
  images: string;
  stock: number;
  isFeatured: boolean;
  isPublished: boolean;
  categoryId: string;
  category: { name: string; slug: string };
  createdAt: Date;
};

export type CartItemLocal = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};
