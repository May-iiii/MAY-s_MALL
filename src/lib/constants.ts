// 会员等级配置
export const MEMBERSHIP_TIERS = {
  FREE: {
    label: "普通会员",
    threshold: 0,
    discountRate: 0,
    color: "bg-gray-100 text-gray-700",
  },
  XINYUE_1: {
    label: "心悦1级",
    threshold: 8000,
    discountRate: 0.02, // 9.8折
    color: "bg-blue-100 text-blue-700",
  },
  XINYUE_2: {
    label: "心悦2级",
    threshold: 80000,
    discountRate: 0.05, // 9.5折
    color: "bg-purple-100 text-purple-700",
  },
  XINYUE_3: {
    label: "心悦3级",
    threshold: 800000,
    discountRate: 0.1, // 9折
    color: "bg-amber-100 text-amber-700",
  },
} as const;

export type MembershipTierKey = keyof typeof MEMBERSHIP_TIERS;

// 订单状态映射
export const ORDER_STATUS = {
  PENDING: { label: "待支付", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "已支付", color: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "已发货", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "已送达", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-700" },
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;

// 用户角色
export const ROLES = {
  CUSTOMER: "普通用户",
  ADMIN: "管理员",
} as const;

// 分页默认值
export const PAGE_SIZE = 12;
