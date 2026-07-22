import { z } from "zod";

// --- 用户 ---
export const registerSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(50),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少8位")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "密码需包含字母和数字"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

// --- 分类 ---
export const categorySchema = z.object({
  name: z.string().min(1, "请输入分类名称").max(50),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
});

// --- 商品 ---
export const productSchema = z.object({
  name: z.string().min(1, "请输入商品名称").max(100),
  description: z.string().min(1, "请输入商品描述"),
  price: z.coerce.number().positive("价格必须大于0"),
  comparePrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0, "库存不能为负"),
  image: z.string().optional(),
  images: z.string().optional(),
  specs: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  categoryId: z.string().min(1, "请选择分类"),
});

// --- 订单 ---
export const createOrderSchema = z.object({
  address: z.string().min(1, "请输入收货地址"),
  phone: z.string().min(1, "请输入联系电话"),
  note: z.string().max(500).optional(),
  // 立刻购买：跳过购物车，只结算单个商品（不落 CartItem）
  buyNow: z
    .object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().positive(),
      specs: z.string().optional(),
    })
    .optional(),
});

// --- 评论 ---
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(500).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
