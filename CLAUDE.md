# MAY's Mall

微型电商项目，涵盖前台购物全流程和后端管理。

## 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| Next.js | 16 (App Router) | 全栈框架，Turbopack 默认打包器 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM |
| SQLite | (dev.db) | 数据库 |
| TailwindCSS | v4 | CSS-first 配置（`@theme` 指令，无 tailwind.config.ts） |
| Auth.js | v5 beta (next-auth) | 认证（Credentials Provider + JWT session） |
| Zod | 4.x | 表单/API 校验 |
| bcryptjs | 3.x | 密码哈希 |
| react-hook-form | 7.x | 复杂表单（后台管理） |

## 项目结构

```
may-s-mall/
├── prisma/
│   ├── schema.prisma          # 数据模型（单一起源）
│   ├── seed.ts                # 种子数据
│   └── migrations/            # 迁移文件
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局（Geist 字体 + SessionProvider）
│   │   ├── globals.css        # Tailwind v4 主题 + 组件层样式
│   │   ├── page.tsx           # 首页入口
│   │   ├── proxy.ts           # Edge 路由保护（← middleware.ts 在 v16 已重命名）
│   │   ├── (shop)/            # 前台路由组（URL 不影响路径）
│   │   ├── (admin)/           # 后台路由组
│   │   └── api/               # API Route Handlers
│   ├── components/
│   │   ├── ui/                # 通用 UI（Button, Input, Badge, Modal, Pagination...）
│   │   ├── shop/              # 前台业务组件
│   │   ├── admin/             # 后台业务组件
│   │   └── layout/            # 布局组件（Header, Footer）
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 单例（globalThis 缓存）
│   │   ├── auth.ts            # Auth.js 配置（Credentials + JWT callback）
│   │   ├── auth.config.ts     # 分离的 auth 配置（供 proxy.ts 用）
│   │   ├── membership.ts      # 会员等级折扣计算 + 升级逻辑
│   │   ├── validations.ts     # Zod schema（注册/登录/商品/订单/评论）
│   │   ├── utils.ts           # formatPrice, slugify, generateOrderNumber, cn, parseJson
│   │   └── constants.ts       # MEMBERSHIP_TIERS, ORDER_STATUS, PAGE_SIZE
│   ├── hooks/                 # 自定义 hooks（useCart, useDebounce, usePagination）
│   ├── providers/             # React Context Providers（Session, Cart, Toast）
│   └── types/                 # 共享 TypeScript 类型 + Auth.js 扩展声明
├── public/uploads/            # 本地图片上传（种子数据用 picsum.photos 占位图）
├── .env                       # DATABASE_URL, AUTH_SECRET, AUTH_URL
└── next.config.ts             # images.remotePatterns
```

## 数据模型 (Prisma)

```
User 1──N Order 1──N OrderItem N──1 Product
User 1──N CartItem N──1 Product
User 1──N Review N──1 Product
Category 1──N Product
```

### 关键枚举

- **Role**: `CUSTOMER` | `ADMIN`
- **MembershipTier**: `FREE` (无折扣) → `XINYUE_1` (满¥8k, 9.8折) → `XINYUE_2` (满¥80k, 9.5折) → `XINYUE_3` (满¥800k, 9折)
- **OrderStatus**: `PENDING` → `PAID` → `SHIPPED` → `DELIVERED` (可 `CANCELLED`)

### 会员系统核心规则

1. 每次下单时根据用户当前 `membershipTier` 计算折扣
2. Order 表存储快照：`originalAmount` (原价) + `discountAmount` (折扣额) + `totalAmount` (实付) + `membershipTier` (下单时等级)
3. 支付成功后 `user.totalSpent += order.totalAmount`，然后判断是否跨级升级
4. 只升不降

### SQLite 适配

- 使用 `relationMode = "prisma"`（SQLite 不支持外键约束）
- `images` 字段为 JSON 字符串，读写时 `JSON.parse/stringify`
- ID 使用 `@default(cuid())`

## 认证方案

Auth.js v5 (next-auth@5.0.0-beta.31) + Credentials Provider。

- Session 策略：JWT（无数据库 session 表）
- 自定义字段通过 JWT callback → session callback 传递：`id`, `role`, `membershipTier`, `totalSpent`
- 类型扩展见 `src/types/next-auth.d.ts`
- `src/lib/auth.ts` 导出 `auth()`, `handlers`, `signIn`, `signOut`
- `src/proxy.ts` 使用 `auth()` 包装函数实现路由保护

### proxy.ts 路由保护规则

| 路径模式 | 要求 |
|---|---|
| `/admin/:path*` | 登录 + role === "ADMIN" |
| `/cart`, `/checkout`, `/orders/:path*` | 登录 |
| `/api/cart/:path*`, `/api/orders/:path*` | 登录 |
| 其他所有路径 | 公开 |

## 数据获取策略

- **Server Components** 直连 Prisma：商品列表/详情、首页展示、仪表盘统计
- **Client Components** 调 API routes：购物车操作、搜索交互、表单提交
- **Server Actions**：商品/分类的新增和编辑表单（避免单独 API 路由）

## 组件拆分原则

- 默认 Server Component，只有需要交互的才标记 `'use client'`
- Client Component 推到叶子节点（如：列表页是 Server Component，只有搜索栏/加购按钮是 Client Component）
- props 传递数据跨越 Server→Client 边界，序列化成本低

## 购物车策略

- **未登录**：localStorage + React Context（瞬时响应，无网络延迟）
- **已登录**：服务端 CartItem 表 + API
- **登录时合并**：读取 localStorage → POST /api/cart 服务端 upsert → 清空 localStorage
- **登出时**：保留服务端数据，清空 Context

## UI 组件层 (globals.css)

TailwindCSS v4 CSS-first 配置，通过 `@theme inline` 定义设计令牌，通过 `@layer components` 定义高频复用样式：

- `.btn` / `.btn-primary` / `.btn-outline` / `.btn-danger` / `.btn-sm` / `.btn-lg`
- `.card`
- `.input-field`
- `.badge`
- `.page-container`

## 种子数据测试账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | admin@maysmall.com | Admin123456 |
| 用户 | user@maysmall.com | User123456 |

## 常用命令

```bash
npm run dev          # 启动开发服务器 (Turbopack, :3000)
npm run build        # 生产构建
npm run db:seed      # 运行种子脚本
npm run db:migrate   # 创建并应用迁移
npm run db:studio    # 打开 Prisma Studio
npx prisma generate  # 重新生成 Prisma Client
```

## 文件创建顺序约定

每个 Phase 内按依赖顺序创建：
1. 配置文件 → 2. 数据层 → 3. 样式 → 4. 工具库 → 5. UI 组件 → 6. 布局 → 7. 页面路由 → 8. 业务组件 → 9. API Routes

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
