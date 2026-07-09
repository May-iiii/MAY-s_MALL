import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并 Tailwind CSS 类名
export function cn(...inputs: ClassValue[]): string {
  // 简单版 cn，不引入 clsx/tailwind-merge 依赖
  return inputs.filter(Boolean).join(" ");
}

// 格式化价格（带两位小数）
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

// 生成 slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

// 生成订单号：ORD-年月日-4位随机
export function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${date}-${random}`;
}

// 安全解析 JSON 字符串
export function parseJson<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
