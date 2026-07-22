// 合并 Tailwind CSS 类名
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}

// 格式化价格（带两位小数）
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

// 生成 slug（保留中文等 Unicode 字母，避免纯中文商品名被过滤成空字符串）
export function slugify(text: string): string {
  const base = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || Math.random().toString(36).slice(2, 10);
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

// 规范化规格 JSON — 按 key 排序保证同一规格不同顺序得相同字符串（用于唯一约束）
export function normalizeSpecs(specs: Record<string, string>): string {
  const sorted = Object.keys(specs)
    .sort()
    .reduce<Record<string, string>>((acc, k) => {
      if (specs[k]) acc[k] = specs[k];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

// 将购物车/订单项存储的 specs JSON 转为展示文案，如 "颜色:黑 · 尺码:M"
export function formatSpecsDisplay(specsJson: string | null | undefined): string {
  if (!specsJson || specsJson === "{}") return "";
  const obj = parseJson<Record<string, string>>(specsJson, {});
  return Object.entries(obj)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(" · ");
}
