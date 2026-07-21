import { describe, it, expect } from "vitest";
import {
  getMembershipDiscount,
  checkTierUpgrade,
  calculateOrderAmount,
} from "./membership";

describe("getMembershipDiscount", () => {
  it("各等级返回正确折扣率", () => {
    expect(getMembershipDiscount("FREE")).toBe(0);
    expect(getMembershipDiscount("XINYUE_1")).toBe(0.02);
    expect(getMembershipDiscount("XINYUE_2")).toBe(0.05);
    expect(getMembershipDiscount("XINYUE_3")).toBe(0.1);
  });

  it("未知等级返回 0", () => {
    expect(getMembershipDiscount("UNKNOWN")).toBe(0);
    expect(getMembershipDiscount("")).toBe(0);
  });
});

describe("checkTierUpgrade", () => {
  it("消费达到门槛时升级", () => {
    expect(checkTierUpgrade(8000, "FREE")).toBe("XINYUE_1");
    expect(checkTierUpgrade(80000, "FREE")).toBe("XINYUE_2");
    expect(checkTierUpgrade(800000, "FREE")).toBe("XINYUE_3");
  });

  it("未达门槛保持原等级", () => {
    expect(checkTierUpgrade(7999, "FREE")).toBe("FREE");
    expect(checkTierUpgrade(5000, "FREE")).toBe("FREE");
  });

  it("只升不降：消费回落不降级", () => {
    // totalSpent 低于当前等级门槛（理论上不应发生，但函数需保证不降级）
    expect(checkTierUpgrade(100, "XINYUE_2")).toBe("XINYUE_2");
    expect(checkTierUpgrade(0, "XINYUE_3")).toBe("XINYUE_3");
  });

  it("可跨级升级", () => {
    expect(checkTierUpgrade(800000, "FREE")).toBe("XINYUE_3");
    expect(checkTierUpgrade(80000, "XINYUE_1")).toBe("XINYUE_2");
  });

  it("边界值：恰好等于门槛即升级", () => {
    expect(checkTierUpgrade(8000, "FREE")).toBe("XINYUE_1");
  });
});

describe("calculateOrderAmount", () => {
  it("FREE 无折扣：原价 = 实付，折扣为 0", () => {
    const r = calculateOrderAmount([{ price: 100, quantity: 2 }], "FREE");
    expect(r.originalAmount).toBe(200);
    expect(r.discountAmount).toBe(0);
    expect(r.totalAmount).toBe(200);
  });

  it("XINYUE_1 打 9.8 折", () => {
    const r = calculateOrderAmount([{ price: 100, quantity: 1 }], "XINYUE_1");
    expect(r.originalAmount).toBe(100);
    expect(r.totalAmount).toBe(98);
    expect(r.discountAmount).toBe(2);
  });

  it("恒等式：originalAmount = discountAmount + totalAmount", () => {
    const cases: Array<[Array<{ price: number; quantity: number }>, string]> = [
      [[{ price: 99.99, quantity: 3 }], "XINYUE_1"],
      [[{ price: 33.33, quantity: 7 }], "XINYUE_2"],
      [[{ price: 12.5, quantity: 11 }, { price: 7.77, quantity: 2 }], "XINYUE_3"],
    ];
    for (const [items, tier] of cases) {
      const r = calculateOrderAmount(items, tier);
      expect(r.discountAmount + r.totalAmount).toBeCloseTo(r.originalAmount, 2);
    }
  });

  it("空购物车金额为 0", () => {
    const r = calculateOrderAmount([], "XINYUE_3");
    expect(r.originalAmount).toBe(0);
    expect(r.discountAmount).toBe(0);
    expect(r.totalAmount).toBe(0);
  });

  it("多商品累加正确", () => {
    const r = calculateOrderAmount(
      [
        { price: 50, quantity: 2 },
        { price: 30, quantity: 1 },
      ],
      "FREE",
    );
    expect(r.originalAmount).toBe(130);
  });
});
