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
| Supabase | PostgreSQL | 云数据库 + Storage 图片存储 |
| TailwindCSS | v4 | CSS-first 样式框架 |
| Auth.js | v5 beta | 用户认证 (JWT Session) |
| Zod | 4.x | 表单/API 校验 |
| bcryptjs | 3.x | 密码加密 |
| react-hook-form | 7.x | 复杂表单管理 |

## 功能模块

### 🏠 前台

- **商品浏览** — 列表展示、搜索、分类筛选、商品详情
- **商品规格** — 多规格选择（颜色/尺码等），价格随规格变动
- **立刻购买** — 跳过购物车，直接从详情页下单
- **用户认证** — 注册/登录，JWT + httpOnly Cookie
- **购物车** — 未登录本地存储 / 已登录服务端同步
- **下单流程** — 结算 → 创建订单 → 模拟支付
- **会员体系** — 心悦等级，累消升级，等级折扣
- **个人信息** — 会员等级、消费统计、升级进度
- **同类推荐** — 商品详情页推荐同分类商品
- **评价系统** — 已购用户可评分 + 文字评价

### 📊 后台管理

- **Dashboard** — 数据概览、统计卡片、最近订单
- **商品管理** — 新增/编辑/删除/搜索/分类筛选/一键上下架/精选管理
- **订单管理** — 状态流转、详情查看
- **分类管理** — 增删改分类
- **用户管理** — 用户列表、消费统计

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev --name init

# 填充种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

### 环境变量

复制 `.env.example` 为 `.env`，按需修改：

```bash
cp .env.example .env
```

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@maysmall.com | Admin123456 |
| 普通用户 | user@maysmall.com | User123456 |

## 项目结构

```
may-s-mall/
├── prisma/                    # 数据模型 + 种子数据
│   ├── schema.prisma           # 7 个模型：User/Category/Product/CartItem/Order/OrderItem/Review
│   └── seed.ts                # 种子：2 用户 + 5 分类 + 15 商品
├── src/
│   ├── app/
│   │   ├── proxy.ts            # Edge 路由保护（登录 + 角色校验）
│   │   ├── (shop)/             # 前台路由组
│   │   │   ├── page.tsx        # 首页（手风琴 Hero + 分类 + 精选）
│   │   │   ├── products/       # 商品列表 + 详情
│   │   │   ├── cart/           # 购物车
│   │   │   ├── checkout/       # 结算
│   │   │   ├── orders/         # 订单列表 + 详情
│   │   │   ├── login/          # 登录
│   │   │   ├── register/       # 注册
│   │   │   └── profile/        # 个人信息
│   │   ├── (admin)/            # 后台路由组
│   │   │   └── admin/          # Dashboard + 商品/订单/分类/用户管理
│   │   └── api/                # REST API Routes
│   ├── components/
│   │   ├── ui/                 # 通用 UI（Button/Input/Badge/Pagination/Modal/ImageAccordion）
│   │   ├── shop/               # 前台组件（ProductCard/PayButton/CategoryFilter/ProductGrid）
│   │   ├── admin/              # 后台组件（AdminSidebar/ProductForm/StatsCards）
│   │   └── layout/             # 布局组件（Header/Footer/NavLink/UserMenu/CartBadge）
│   ├── lib/                    # 工具库
│   │   ├── auth.ts             # Auth.js 配置（Credentials + JWT）
│   │   ├── membership.ts       # 会员折扣计算 + 升级逻辑
│   │   ├── validations.ts      # Zod schemas（注册/登录/商品/订单/评论）
│   │   ├── utils.ts            # formatPrice/slugify/cn/generateOrderNumber
│   │   └── constants.ts        # MEMBERSHIP_TIERS/ORDER_STATUS/PAGE_SIZE
│   ├── hooks/                  # 自定义 hooks（useCart/useDebounce/usePagination）
│   ├── providers/              # Context Providers（Session/Cart/Toast）
│   └── types/                  # TypeScript 类型定义
├── public/
│   ├── uploads/                # （已废弃，改用 Supabase Storage）
│   └── screenshots/            # 页面截图
└── .env.example                # 环境变量模板
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

> 运行 `npm run dev` 后，在浏览器中截取以下页面（推荐 1440×900 视口），放入 `public/screenshots/` 目录。

### 前台页面

| 页面 | 路由 | 截图路径 | 重点内容 |
|------|------|---------|---------|
| 首页 | `/` | `public/screenshots/homepage.png` | Hero 手风琴 + 分类卡片 + 精选商品网格 |
| 商品列表 | `/products` | `public/screenshots/products.png` | 搜索框 + 分类筛选 + 商品卡片网格 |
| 商品详情 | `/products/iphone-15-pro` | `public/screenshots/product-detail.png` | 商品大图 + 规格选择器 + 立刻购买按钮 |
| 购物车 | `/cart` | `public/screenshots/cart.png` | 商品列表 + 数量调整 + 价格汇总 |
| 结算 | `/checkout` | `public/screenshots/checkout.png` | 收货信息表单 + 订单金额明细 |
| 订单列表 | `/orders` | `public/screenshots/orders.png` | 订单列表 + 状态标签 |
| 订单详情 | `/orders/` + 任意订单 | `public/screenshots/order-detail.png` | 订单金额快照 + 支付/取消按钮 |
| 登录 | `/login` | `public/screenshots/login.png` | 登录表单 |
| 注册 | `/register` | `public/screenshots/register.png` | 注册表单 |
| 个人中心 | `/profile` | `public/screenshots/profile.png` | 会员等级 + 累计消费 + 升级进度条 |

### 后台页面

| 页面 | 路由 | 截图路径 | 重点内容 |
|------|------|---------|---------|
| Dashboard | `/admin` | `public/screenshots/admin-dashboard.png` | 统计卡片（订单/用户/商品）+ 最近订单 |
| 商品管理 | `/admin/products` | `public/screenshots/admin-products.png` | 商品表格 + 分类筛选 + 上架/精选切换按钮 |
| 新增商品 | `/admin/products/new` | `public/screenshots/admin-product-new.png` | 创建表单（含图片上传 + 规格编辑器） |
| 编辑商品 | `/admin/products/` + 商品 ID | `public/screenshots/admin-product-edit.png` | 编辑表单（已填充数据） |
| 订单管理 | `/admin/orders` | `public/screenshots/admin-orders.png` | 订单表格 + 状态流转操作 |
| 分类管理 | `/admin/categories` | `public/screenshots/admin-categories.png` | 分类列表 + 新增/编辑弹窗 |
| 用户管理 | `/admin/users` | `public/screenshots/admin-users.png` | 用户列表 + 消费统计 |
