# MAY's Mall

一个微型电商平台，涵盖前台购物全流程和后台管理系统。

## 首页预览

![首页截图](./public/screenshots/homepage.png)

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 (App Router) | 全栈框架，Turbopack 默认打包器 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM |
| SQLite | — | 轻量本地数据库 |
| TailwindCSS | v4 | CSS-first 样式框架 |
| Auth.js | v5 beta | 用户认证 (JWT Session) |
| Zod | 4.x | 表单/API 校验 |
| bcryptjs | 3.x | 密码加密 |
| react-hook-form | 7.x | 复杂表单管理 |

## 功能模块

### 🏠 前台
- **商品浏览** — 列表展示、搜索、分类筛选、商品详情
- **用户认证** — 注册/登录，JWT + httpOnly Cookie
- **购物车** — 未登录本地存储 / 已登录服务端同步
- **下单流程** — 结算 → 创建订单 → 模拟支付
- **会员体系** — 心悦等级，累消升级，等级折扣
- **个人信息** — 会员等级、消费统计、升级进度

### 📊 后台管理
- **Dashboard** — 数据概览、统计卡片、最近订单
- **商品管理** — 新增/编辑/删除/搜索/分类筛选
- **订单管理** — 状态流转、详情查看
- **分类管理** — 增删分类

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库 + 种子数据
npx prisma migrate dev --name init
npm run db:seed

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@maysmall.com | Admin123456 |
| 普通用户 | user@maysmall.com | User123456 |

## 项目结构

```
may-s-mall/
├── prisma/                  # 数据模型 + 种子数据
│   ├── schema.prisma         # 7 个模型：User/Category/Product/CartItem/Order/OrderItem/Review
│   └── seed.ts              # 种子：2 用户 + 5 分类 + 15 商品
├── src/
│   ├── app/
│   │   ├── (shop)/           # 前台路由组
│   │   │   ├── page.tsx      # 首页（图片手风琴 Hero + 分类 + 精选）
│   │   │   ├── products/     # 商品列表 + 详情
│   │   │   ├── cart/         # 购物车 + 结算
│   │   │   ├── orders/       # 订单列表 + 详情
│   │   │   ├── login/        # 登录
│   │   │   ├── register/     # 注册
│   │   │   └── profile/      # 个人信息
│   │   ├── (admin)/          # 后台路由组
│   │   │   └── admin/        # Dashboard + 商品/订单/分类管理
│   │   └── api/              # REST API Routes
│   ├── components/
│   │   ├── ui/               # 通用组件 (Button/Input/Badge/Pagination/ImageAccordion)
│   │   ├── shop/             # 前台组件 (ProductCard/PayButton/CategoryFilter)
│   │   ├── admin/            # 后台组件 (AdminSidebar/ProductForm)
│   │   └── layout/           # 布局组件 (Header/Footer/NavLink/UserMenu)
│   ├── lib/                  # 工具库
│   │   ├── auth.ts           # JWT 认证 + bcrypt 密码
│   │   ├── membership.ts     # 会员折扣 + 升级逻辑
│   │   ├── validations.ts    # Zod schemas
│   │   └── utils.ts          # formatPrice/slugify/cn
│   └── providers/            # SessionProvider (AuthContext)
├── public/uploads/           # 本地图片上传
└── .env.example              # 环境变量模板
```

## 常用命令

```bash
npm run dev          # 开发服务器 (Turbopack, :3000)
npm run build        # 生产构建
npm run db:seed      # 种子数据
npm run db:migrate   # 数据库迁移
npm run db:studio    # Prisma Studio
npx prisma generate  # 重新生成 Prisma Client
```

## 会员体系

| 等级 | 累计消费 | 折扣 |
|------|---------|------|
| 普通会员 | ¥0 | 无 |
| 心悦 1 级 | ¥8,000 | 9.8 折 |
| 心悦 2 级 | ¥80,000 | 9.5 折 |
| 心悦 3 级 | ¥800,000 | 9.0 折 |

- 下单时根据当前等级计算折扣，存储金额快照
- 支付成功后累加消费额，自动检查升级
- 只升不降

## 截图

> 运行 `npm run dev` 后拍摄以下页面截图放入 `public/screenshots/` 目录：

| 页面 | 路径 | 建议截图 |
|------|------|---------|
| 首页 | `/` | Hero 手风琴 + 分类卡片 |
| 商品列表 | `/products` | 搜索 + 筛选 + 商品网格 |
| 商品详情 | `/products/*` | 大图 + 信息 + 加购按钮 |
| 购物车 | `/cart` | 商品列表 + 总计 |
| 订单详情 | `/orders/*` | 金额明细 + 支付按钮 |
| 后台 Dashboard | `/admin` | 统计卡片 + 最近订单 |
| 后台商品管理 | `/admin/products` | 表格 + 分类筛选 |
