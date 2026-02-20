# iOS 开发者的全栈 Web 教程 — 第一部分：架构概览

> 本教程面向没有 Web/Backend 经验的 iOS 开发者，用你熟悉的 iOS 概念来类比解释。

---

## 1. 项目是什么

这是一个 **个人作品集 + CMS（内容管理系统）** 网站，包含：
- **公开网站**：展示你的项目、博客、简历（给 HR / 访客看）
- **Admin 后台**：管理内容的界面（只有你能登录）

iOS 类比：相当于你做了一个 App（前端）+ 后端 API + 数据库，全部在一个项目里。

---

## 2. 技术栈对照表

| Web 技术 | 作用 | iOS 对应 |
|----------|------|----------|
| **Next.js** | 全栈框架（前端 + 后端） | 相当于 SwiftUI + Vapor 合体 |
| **React** | UI 库 | SwiftUI |
| **TypeScript** | 类型安全的 JavaScript | Swift |
| **Tailwind CSS** | 样式工具 | 类似 SwiftUI 的 modifier（`.font(.title)` `.padding()`） |
| **Prisma** | 数据库 ORM | Core Data / SwiftData |
| **PostgreSQL** | 关系型数据库 | SQLite（但更强大） |
| **Docker** | 容器化运行环境 | 类似 Simulator，但是给服务器用的 |
| **JWT** | 用户认证令牌 | Keychain 里存的 access token |
| **Zod** | 数据验证 | Codable + 自定义 validation |

---

## 3. 整体架构

```
┌─────────────────────────────────────────────────┐
│                   浏览器 (Client)                 │
│                                                   │
│   ┌──────────────┐       ┌──────────────┐        │
│   │  公开页面     │       │  Admin 后台   │        │
│   │  /           │       │  /admin      │        │
│   │  /blog       │       │  /admin/blog │        │
│   │  /resume     │       │  /admin/resume│       │
│   │  /projects   │       │  /admin/uploads│      │
│   └──────┬───────┘       └──────┬───────┘        │
│          │                      │                 │
└──────────┼──────────────────────┼─────────────────┘
           │  HTTP 请求            │  HTTP 请求
           ▼                      ▼
┌─────────────────────────────────────────────────┐
│              Next.js 服务器                       │
│                                                   │
│   ┌──────────────┐       ┌──────────────┐        │
│   │  页面渲染     │       │  API Routes  │        │
│   │  (SSR/CSR)   │       │  /api/blog   │        │
│   │              │       │  /api/auth   │        │
│   │              │       │  /api/upload │        │
│   └──────────────┘       └──────┬───────┘        │
│                                  │                │
│   ┌──────────────┐              │                │
│   │  Middleware   │              │                │
│   │  (路由守卫)   │              │                │
│   └──────────────┘              │                │
└─────────────────────────────────┼─────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │  PostgreSQL 数据库     │
                    │  (Docker 容器)        │
                    │                      │
                    │  - admins            │
                    │  - projects          │
                    │  - blog_posts        │
                    │  - resume_profiles   │
                    │  - experiences       │
                    │  - educations        │
                    │  - skills            │
                    │  - uploads           │
                    └──────────────────────┘
```

### iOS 类比

```
iOS App 架构                    Web App 架构
─────────────                   ─────────────
UIKit/SwiftUI View      ←→     React 组件 (TSX 文件)
ViewController          ←→     Page 组件 (page.tsx)
Navigation/Router       ←→     Next.js 文件路由
URLSession              ←→     fetch() API
Middleware/Interceptor  ←→     middleware.ts
API Server (Vapor等)    ←→     API Routes (/api/*)
Core Data / SwiftData   ←→     Prisma ORM
SQLite                  ←→     PostgreSQL
Keychain                ←→     HTTP Cookie (JWT)
Info.plist              ←→     .env 环境变量
SPM/CocoaPods           ←→     npm (package.json)
Xcode                   ←→     VS Code + 终端
```

---

## 4. 项目目录结构

```
web/
├── src/                        # 源代码（相当于 iOS 项目的 Sources/）
│   ├── app/                    # 页面和路由（核心！）
│   │   ├── layout.tsx          # 根布局（相当于 App.swift）
│   │   ├── page.tsx            # 首页（相当于 ContentView.swift）
│   │   ├── globals.css         # 全局样式
│   │   ├── (admin)/            # Admin 路由组
│   │   │   └── admin/          # /admin/* 的所有页面
│   │   ├── (public)/           # 公开路由组
│   │   │   ├── blog/           # /blog/* 的所有页面
│   │   │   ├── projects/       # /projects 页面
│   │   │   └── resume/         # /resume 页面
│   │   └── api/                # 后端 API（相当于 Vapor 的 routes）
│   │       ├── auth/           # 认证相关 API
│   │       ├── blog/           # 博客 CRUD API
│   │       ├── projects/       # 项目 CRUD API
│   │       ├── resume/         # 简历 CRUD API
│   │       └── upload/         # 文件上传 API
│   ├── components/             # 可复用组件（相当于自定义 View）
│   │   ├── ui/                 # 基础 UI 组件（Button, Input 等）
│   │   ├── admin/              # Admin 专用组件
│   │   ├── layout/             # 布局组件（Navbar, Footer）
│   │   ├── blog/               # 博客相关组件
│   │   ├── projects/           # 项目相关组件
│   │   ├── scroll/             # 滚动动画组件
│   │   └── acts/               # 首页各区块组件
│   ├── lib/                    # 工具库（相当于 Utilities/）
│   │   ├── auth.ts             # 认证逻辑
│   │   ├── prisma.ts           # 数据库连接
│   │   ├── upload.ts           # 文件上传处理
│   │   ├── constants.ts        # 常量定义
│   │   └── utils.ts            # 工具函数
│   ├── hooks/                  # 自定义 React Hooks
│   ├── validators/             # 数据验证 Schema
│   ├── types/                  # TypeScript 类型定义
│   ├── styles/                 # 字体等样式配置
│   └── middleware.ts           # 路由中间件（路由守卫）
├── prisma/                     # 数据库相关
│   ├── schema.prisma           # 数据库模型定义
│   ├── seed.ts                 # 初始数据填充脚本
│   └── migrations/             # 数据库迁移记录
├── public/                     # 静态资源（图片、上传文件等）
│   └── uploads/                # 用户上传的文件
├── docker-compose.yml          # Docker 配置（数据库）
├── package.json                # 依赖管理（相当于 Package.swift）
├── tsconfig.json               # TypeScript 配置
├── next.config.ts              # Next.js 配置
├── .env                        # 环境变量（不提交到 Git）
└── .gitignore                  # Git 忽略规则
```

---

## 5. 数据流：一个完整请求的生命周期

以 "HR 在公开页面查看博客列表" 为例：

```
1. HR 打开浏览器，访问 http://yoursite.com/blog
                    │
                    ▼
2. Next.js 路由匹配到 src/app/(public)/blog/page.tsx
                    │
                    ▼
3. 这是一个 Server Component（服务端组件），
   Next.js 在服务端执行代码：
   - 调用 prisma.blogPost.findMany() 查询数据库
   - 只返回 status === "PUBLISHED" 的文章
                    │
                    ▼
4. 服务端将查询结果渲染成 HTML
                    │
                    ▼
5. HTML 发送到浏览器显示
```

以 "Admin 创建一篇新博客" 为例：

```
1. Admin 在浏览器访问 /admin/blog/new
                    │
                    ▼
2. middleware.ts 拦截请求，检查 Cookie 中的 JWT
   - 有效：放行
   - 无效：重定向到 /admin/login
                    │
                    ▼
3. 页面是 Client Component（客户端组件），
   在浏览器中运行 React 代码，显示表单
                    │
                    ▼
4. Admin 填写表单，点击 "Publish"
                    │
                    ▼
5. 前端 fetch() 发送 POST 请求到 /api/blog
                    │
                    ▼
6. API Route 处理请求：
   a. verifyAuth() 验证 JWT → 确认是管理员
   b. Zod schema 验证请求数据 → 确认数据格式正确
   c. prisma.blogPost.create() → 写入数据库
   d. 返回 JSON 响应 { success: true, data: {...} }
                    │
                    ▼
7. 前端收到响应，跳转到博客列表页
```

---

## 6. Server Component vs Client Component

这是 Next.js 最核心的概念，也是和 iOS 最大的差异。

### Server Component（默认）
```tsx
// 没有 "use client" 声明 → 这是 Server Component
// 代码只在服务端执行，浏览器看不到这段代码

export default async function BlogPage() {
  // 这行代码在服务器上执行，直接查数据库
  const posts = await prisma.blogPost.findMany();

  return <div>{posts.map(p => <h1>{p.title}</h1>)}</div>;
}
```

**iOS 类比**：想象你的 SwiftUI View 在服务器上渲染成图片，然后发给手机显示。用户看不到你的代码逻辑。

### Client Component
```tsx
"use client"; // ← 这行声明让它变成 Client Component
// 代码会发送到浏览器执行

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState(""); // 浏览器中管理状态

  return <input value={email} onChange={e => setEmail(e.target.value)} />;
}
```

**iOS 类比**：这就像正常的 SwiftUI View，`@State` 就是 `useState`。

### 何时用哪个？

| 场景 | 类型 | 原因 |
|------|------|------|
| 博客列表页 | Server | 只需展示数据，不需要交互 |
| 登录表单 | Client | 需要管理输入状态、处理点击事件 |
| Admin 编辑页 | Client | 表单交互、文件上传等 |
| Resume 展示页 | Server | 只是展示数据 |

---

## 下一部分

- [第二部分：前端详解 — React、组件、样式](./tutorial-02-frontend.md)
- [第三部分：后端详解 — API、数据库、认证](./tutorial-03-backend.md)
- [第四部分：开发工具与命令行](./tutorial-04-tooling.md)
