import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_TIERS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { MembershipTierKey } from "@/lib/constants";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/profile");

  const [orderCount, totalSpent] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { userId: user.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  const tier = MEMBERSHIP_TIERS[user.membershipTier as MembershipTierKey];
  const nextTier = Object.entries(MEMBERSHIP_TIERS).find(
    ([, v]) => v.threshold > user.totalSpent,
  );

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-text-primary">个人信息</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 基本信息 */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-text-primary">基本信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">姓名</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">邮箱</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">角色</span>
              <span className="font-medium">{user.role === "ADMIN" ? "管理员" : "普通用户"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">注册时间</span>
              <span className="font-medium">
                {new Date(user.createdAt || "").toLocaleDateString("zh-CN")}
              </span>
            </div>
          </div>
        </div>

        {/* 会员信息 */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-text-primary">会员信息</h2>
          <div className="flex items-center gap-4">
            <span className={`badge text-sm px-3 py-1 ${tier?.color || ""}`}>
              {tier?.label || user.membershipTier}
            </span>
            {tier && tier.discountRate > 0 && (
              <span className="text-sm text-text-secondary">
                享 {(1 - tier.discountRate) * 10} 折优惠
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">累计消费</span>
              <span className="font-medium">{formatPrice(user.totalSpent)}</span>
            </div>
            {nextTier && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    距 {nextTier[1].label} 还需
                  </span>
                  <span className="font-medium">
                    {formatPrice(nextTier[1].threshold - user.totalSpent)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (user.totalSpent / nextTier[1].threshold) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 消费统计 */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-text-primary">消费统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">订单总数</p>
              <p className="mt-1 text-2xl font-bold">{orderCount}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">总消费额</p>
              <p className="mt-1 text-2xl font-bold text-success">
                {formatPrice(totalSpent._sum.totalAmount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/orders" className="btn-outline btn-sm">
          ← 查看我的订单
        </Link>
      </div>
    </div>
  );
}
