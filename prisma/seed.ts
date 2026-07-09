import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. 创建管理员
  const adminPassword = await bcrypt.hash("Admin123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@maysmall.com" },
    update: {},
    create: {
      email: "admin@maysmall.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  // 2. 创建普通用户
  const userPassword = await bcrypt.hash("User123456", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@maysmall.com" },
    update: {},
    create: {
      email: "user@maysmall.com",
      name: "Test User",
      password: userPassword,
      role: "CUSTOMER",
      membershipTier: "XINYUE_1",
      totalSpent: 10000,
    },
  });
  console.log(`  ✅ User: ${user.email}`);

  // 3. 创建分类
  const categories = [
    { name: "电子产品", slug: "electronics", description: "手机、电脑、耳机等数码产品" },
    { name: "服装服饰", slug: "clothing", description: "男女服装、鞋帽、配饰" },
    { name: "家居生活", slug: "home-living", description: "家具、厨具、日用品" },
    { name: "食品饮料", slug: "food-drinks", description: "零食、饮料、健康食品" },
    { name: "图书文具", slug: "books-stationery", description: "图书、杂志、文具用品" },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(c);
    console.log(`  ✅ Category: ${c.name}`);
  }

  // 4. 创建商品
  const products = [
    { name: "无线蓝牙耳机 Pro", slug: "wireless-earbuds-pro", price: 299, comparePrice: 499, stock: 100, isFeatured: true, categoryIdx: 0, description: "高品质无线蓝牙耳机，支持主动降噪，续航长达30小时。" },
    { name: "机械键盘 RGB", slug: "mechanical-keyboard-rgb", price: 459, comparePrice: 599, stock: 50, isFeatured: true, categoryIdx: 0, description: "Cherry MX 轴体，全键RGB背光，铝合金面板。" },
    { name: "USB-C 扩展坞", slug: "usb-c-hub", price: 199, stock: 80, isFeatured: false, categoryIdx: 0, description: "7合1 Type-C扩展坞，支持HDMI 4K输出、SD卡读取。" },
    { name: "便携充电宝 20000mAh", slug: "power-bank-20000", price: 129, comparePrice: 199, stock: 200, isFeatured: true, categoryIdx: 0, description: "大容量快充充电宝，支持PD 65W双向快充。" },
    { name: "男士休闲夹克", slug: "mens-casual-jacket", price: 389, comparePrice: 699, stock: 60, isFeatured: true, categoryIdx: 1, description: "春秋款休闲夹克，防水面料，简约百搭。" },
    { name: "女士连衣裙", slug: "womens-dress", price: 259, stock: 45, isFeatured: false, categoryIdx: 1, description: "夏季碎花连衣裙，纯棉面料，舒适透气。" },
    { name: "运动跑鞋", slug: "running-shoes", price: 529, comparePrice: 799, stock: 35, isFeatured: true, categoryIdx: 1, description: "轻便透气跑鞋，缓震回弹，适合日常训练。" },
    { name: "记忆棉枕头", slug: "memory-foam-pillow", price: 149, comparePrice: 249, stock: 120, isFeatured: false, categoryIdx: 2, description: "慢回弹记忆棉，人体工学设计，保护颈椎。" },
    { name: "不锈钢保温杯", slug: "thermos-cup", price: 89, stock: 300, isFeatured: false, categoryIdx: 2, description: "316不锈钢内胆，12小时保温，500ml大容量。" },
    { name: "智能台灯", slug: "smart-desk-lamp", price: 199, comparePrice: 299, stock: 75, isFeatured: false, categoryIdx: 2, description: "LED护眼台灯，无级调光调色，支持手机控制。" },
    { name: "有机绿茶礼盒", slug: "organic-green-tea", price: 168, stock: 90, isFeatured: false, categoryIdx: 3, description: "高山有机绿茶，明前采摘，礼盒装250g。" },
    { name: "坚果混合装", slug: "mixed-nuts-pack", price: 79, comparePrice: 99, stock: 150, isFeatured: false, categoryIdx: 3, description: "每日坚果混合装，6种坚果搭配，750g大包装。" },
    { name: "TypeScript 编程指南", slug: "typescript-guide-book", price: 79, stock: 200, isFeatured: false, categoryIdx: 4, description: "从入门到精通TypeScript，涵盖高级类型和实战项目。" },
    { name: "方格笔记本 5本装", slug: "grid-notebook-set", price: 35, stock: 500, isFeatured: false, categoryIdx: 4, description: "A5方格笔记本，80g加厚纸张，5本装。" },
    { name: "4K显示器 27寸", slug: "4k-monitor-27", price: 2499, comparePrice: 3299, stock: 20, isFeatured: true, categoryIdx: 0, description: "27寸4K IPS显示器，HDR400，Type-C 65W供电。" },
  ];

  for (const p of products) {
    const slug = p.slug;
    const images = JSON.stringify([`https://picsum.photos/seed/${slug}/640/480`, `https://picsum.photos/seed/${slug}-2/640/480`]);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: p.stock,
        isFeatured: p.isFeatured,
        image: `https://picsum.photos/seed/${slug}/640/480`,
        images,
        categoryId: createdCategories[p.categoryIdx].id,
      },
    });
  }
  console.log(`  ✅ ${products.length} products created`);

  console.log("\n🎉 Seed complete!");
  console.log("   Admin: admin@maysmall.com / Admin123456");
  console.log("   User:  user@maysmall.com / User123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
