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

  // 按门槛从低到高排序（只升不降）
  const tierOrder = (
    Object.entries(MEMBERSHIP_TIERS) as [
      MembershipTierKey,
      (typeof MEMBERSHIP_TIERS)[MembershipTierKey],
    ][]
  ).sort((a, b) => a[1].threshold - b[1].threshold);

  const currentIndex = tierOrder.findIndex(
    ([key]) => key === (currentTier as MembershipTierKey),
  );
  const newIndex = tierOrder.findIndex(
    ([key]) => key === highestTier,
  );

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
  // 先计算实付总额再取整，保证 originalAmount = discountAmount + totalAmount
  const totalAmount = Math.round((originalAmount * (1 - discountRate)) * 100) / 100;
  const discountAmount = Math.round((originalAmount - totalAmount) * 100) / 100;

  return {
    originalAmount: Math.round(originalAmount * 100) / 100,
    discountAmount,
    totalAmount,
  };
}
