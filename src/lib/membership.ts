import { MEMBERSHIP_TIERS, type MembershipTierKey } from "./constants";

// 获取会员折扣率
export function getMembershipDiscount(tier: string): number {
  const key = tier as MembershipTierKey;
  return MEMBERSHIP_TIERS[key]?.discountRate ?? 0;
}

// 检查并升级会员等级（只升不降）
export function checkTierUpgrade(totalSpent: number, currentTier: string): string {
  const tiers = Object.entries(MEMBERSHIP_TIERS) as [
    MembershipTierKey,
    (typeof MEMBERSHIP_TIERS)[MembershipTierKey],
  ][];

  // 找到 totalSpent 能达到的最高等级
  let highestTier: MembershipTierKey = "FREE";
  for (const [key, config] of tiers) {
    if (totalSpent >= config.threshold) {
      highestTier = key;
    }
  }

  // 等级排序（只升不降）
  const tierOrder: MembershipTierKey[] = ["FREE", "XINYUE_1", "XINYUE_2", "XINYUE_3"];
  const currentIndex = tierOrder.indexOf(currentTier as MembershipTierKey);
  const newIndex = tierOrder.indexOf(highestTier);

  return newIndex > currentIndex ? highestTier : currentTier;
}

// 计算订单金额
export function calculateOrderAmount(
  items: Array<{ price: number; quantity: number }>,
  membershipTier: string,
) {
  const originalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountRate = getMembershipDiscount(membershipTier);
  const discountAmount = originalAmount * discountRate;
  const totalAmount = originalAmount - discountAmount;

  return {
    originalAmount: Math.round(originalAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}
