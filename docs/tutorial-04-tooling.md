# iOS 开发者的全栈 Web 教程 — 第四部分：开发工具与命令行

---

## 1. 包管理 — npm vs SPM

### 1.1 核心概念对照

| npm (Web) | SPM / CocoaPods (iOS) |
|-----------|----------------------|
| `package.json` | `Package.swift` / `Podfile` |
| `node_modules/` | `.build/` / `Pods/` |
| `package-lock.json` | `Package.resolved` / `Podfile.lock` |
| `npm install` | `swift package resolve` / `pod install` |
| `npm install axios` | `swift package add axios` / 在 Podfile 加一行 |
| `npm run dev` | `cmd+R` 运行 |
| `npm run build` | `xcodebuild archive` |

### 1.2 package.json 详解

```json
{
  "name": "cinematic-portfolio",   // 项目名
  "version": "0.1.0",              // 版本号
  "private": true,                 // 不发布到 npm 仓库

  "scripts": {
    // 命令别名，通过 npm run <name> 执行
    "dev": "next dev",                    // 启动开发服务器（带热重载）
    "build": "next build",                // 生产构建
    "start": "next start",                // 启动生产服务器
    "lint": "eslint",                     // 代码检查
    "db:generate": "npx prisma generate", // 生成 Prisma Client
    "db:migrate": "npx prisma migrate dev", // 数据库迁移
    "db:push": "npx prisma db push",      // 推送 schema 变更
    "db:seed": "npx tsx prisma/seed.ts",   // 填充初始数据
    "db:studio": "npx prisma studio"       // 可视化数据库管理
  },

  "dependencies": {
    // 生产依赖（打包到最终产物中）
    "@prisma/client": "^6.19.2",     // Prisma ORM 客户端
    "next": "16.1.6",                // Next.js 框架
    "react": "19.2.3",               // React UI 库
    "react-dom": "19.2.3",           // React DOM 渲染
    "bcryptjs": "^3.0.3",            // 密码哈希
    "jose": "^6.1.3",                // JWT 处理
    "zod": "^4.3.6",                 // 数据验证
    "lucide-react": "^0.575.0",      // 图标库
    "motion": "^12.34.2",            // 动画库
    "tailwind-merge": "^3.5.0",      // Tailwind class 合并
    "clsx": "^2.1.1",                // 条件 class 名
    "@tiptap/react": "^3.20.0",      // 富文本编辑器
    // ...
  },

  "devDependencies": {
    // 开发依赖（不打包到最终产物）
    "typescript": "^5",              // TypeScript 编译器
    "prisma": "^6.19.2",             // Prisma CLI
    "tailwindcss": "^4",             // Tailwind CSS
    "@types/react": "^19",           // React 类型定义
    // ...
  }
}
```

### 1.3 版本号语义

```
"next": "16.1.6"     ← 精确版本
"react": "^19.2.3"   ← ^表示兼容版本（19.x.x 都可以）
"zod": "~4.3.6"      ← ~表示补丁版本（4.3.x 都可以）
```

### 1.4 常用 npm 命令

```bash
# 安装所有依赖（首次 clone 项目后执行）
npm install

# 安装新依赖
npm install axios              # 生产依赖
npm install -D @types/node     # 开发依赖（-D）

# 移除依赖
npm uninstall axios

# 执行 scripts 中定义的命令
npm run dev
npm run build
npm run db:seed

# npx — 执行 node_modules/.bin/ 中的命令
npx prisma studio    # 不需要全局安装 prisma
```

---

## 2. TypeScript — Swift 开发者视角

### 2.1 类型系统对比

```typescript
// 基本类型
let name: string = "Zhen";        // Swift: let name: String = "Zhen"
let age: number = 30;             // Swift: let age: Int = 30
let active: boolean = true;       // Swift: let active: Bool = true
let tags: string[] = ["swift"];   // Swift: let tags: [String] = ["swift"]

// 可选类型
let bio: string | null = null;    // Swift: let bio: String? = nil
let url?: string;                 // Swift: var url: String?

// 接口（类似 Swift protocol/struct）
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;            // ? 表示可选
  tags: string[];
  status: "DRAFT" | "PUBLISHED";  // 联合类型（类似枚举）
}

// 类型别名
type ButtonVariant = "primary" | "secondary" | "ghost";
// Swift: enum ButtonVariant: String { case primary, secondary, ghost }

// 泛型
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
// Swift: func first<T>(_ arr: [T]) -> T? { arr.first }
```

### 2.2 tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2017",           // 编译目标
    "lib": ["dom", "esnext"],     // 可用的 API
    "strict": true,               // 严格类型检查（推荐）
    "jsx": "preserve",            // 保留 JSX 语法
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]          // 路径别名：@/ = src/
    }
  }
}
```

`@/` 路径别名：
```tsx
// 不用写 "../../../lib/utils"
import { cn } from "@/lib/utils";      // = src/lib/utils
import { Button } from "@/components/ui"; // = src/components/ui
```

**iOS 类比**：类似 Swift Package 的 module 名，`import MyModule` 就能访问模块内的代码。

---

## 3. Docker — 数据库容器

### 3.1 什么是 Docker

Docker 可以理解为一个 **轻量级虚拟机**，把软件和它的运行环境打包在一起。

在这个项目中，Docker 只用来运行 PostgreSQL 数据库，这样你不需要手动安装 PostgreSQL。

**iOS 类比**：类似 iOS Simulator，它提供了一个隔离的运行环境。

### 3.2 docker-compose.yml 详解

```yaml
services:
  db:                              # 服务名称
    image: postgres:16-alpine      # 使用 PostgreSQL 16（Alpine Linux 精简版）
    restart: unless-stopped        # 崩溃后自动重启
    environment:                   # 环境变量（数据库配置）
      POSTGRES_USER: portfolio     # 数据库用户名
      POSTGRES_PASSWORD: portfolio_dev  # 密码
      POSTGRES_DB: portfolio       # 数据库名
    ports:
      - "5432:5432"               # 映射端口（主机:容器）
    volumes:
      - pgdata:/var/lib/postgresql/data  # 数据持久化

volumes:
  pgdata:                         # 命名卷（数据不会因容器删除而丢失）
```

### 3.3 Docker 常用命令

```bash
# 启动数据库（后台运行）
docker compose up -d

# 查看运行状态
docker compose ps

# 查看日志
docker compose logs db

# 停止数据库
docker compose stop

# 停止并删除容器（数据保留在 volume 中）
docker compose down

# 停止并删除所有数据（谨慎！）
docker compose down -v
```

---

## 4. 环境变量 — .env 文件

### 4.1 什么是环境变量

环境变量用于存储敏感信息（密码、密钥）和环境相关配置，不提交到 Git。

```bash
# .env 文件
DATABASE_URL="postgresql://portfolio:portfolio_dev@localhost:5432/portfolio"
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4.2 命名规则

```
DATABASE_URL          → 只在服务端可用（API Routes、Server Components）
JWT_SECRET            → 只在服务端可用
NEXT_PUBLIC_SITE_URL  → NEXT_PUBLIC_ 前缀 = 前后端都可用（会暴露给浏览器！）
```

**重要**：不要给敏感信息加 `NEXT_PUBLIC_` 前缀，否则会暴露给所有访客。

### 4.3 在代码中使用

```tsx
// 服务端代码
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.JWT_SECRET;

// 客户端和服务端都能用
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

**iOS 类比**：类似 Xcode 的 Configuration Settings（xcconfig）或 Info.plist：
```swift
let apiKey = Bundle.main.infoDictionary?["API_KEY"] as? String
```

---

## 5. 开发工作流

### 5.1 首次设置

```bash
# 1. 克隆项目
git clone <repo-url>
cd web

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 启动数据库
docker compose up -d

# 5. 初始化数据库
npm run db:generate   # 生成 Prisma Client 类型
npm run db:push       # 创建数据库表
npm run db:seed       # 填充初始数据

# 6. 启动开发服务器
npm run dev
# → http://localhost:3000
```

### 5.2 日常开发

```bash
# 启动开发服务器（每次开发前）
docker compose up -d   # 确保数据库在运行
npm run dev            # 启动 Next.js（支持热重载，保存文件自动刷新）

# 修改数据库 schema 后
# 1. 编辑 prisma/schema.prisma
# 2. 运行：
npm run db:push        # 同步到数据库
npm run db:generate    # 重新生成类型

# 可视化查看/编辑数据库
npm run db:studio      # 在浏览器中打开 Prisma Studio
```

### 5.3 热重载 (Hot Reload)

Next.js 开发模式自带热重载：
- 修改 `.tsx` 文件 → 浏览器自动刷新（保持组件状态）
- 修改 `globals.css` → 样式即时更新
- 修改 API route → 下次请求生效

**iOS 类比**：类似 Xcode 的 SwiftUI Preview 实时预览，但更彻底。

### 5.4 生产部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 6. 常用调试技巧

### 6.1 浏览器 DevTools

- **F12** 或 **Cmd+Option+I** 打开 DevTools
- **Elements** 面板：查看/修改 HTML 和 CSS（类似 Xcode View Debugger）
- **Console** 面板：查看 `console.log` 输出和错误（类似 Xcode Console）
- **Network** 面板：查看所有网络请求（类似 Charles/Proxyman）
- **Application → Cookies**：查看和删除 Cookie

### 6.2 移动端调试

在 DevTools 中点击 **设备图标**（或 Cmd+Shift+M）可以模拟手机屏幕。

### 6.3 API 调试

```bash
# 用 curl 测试 API（类似 Postman）
curl http://localhost:3000/api/blog | python3 -m json.tool

# 带认证的请求
curl -b "auth-token=your-jwt-here" http://localhost:3000/api/upload
```

### 6.4 数据库调试

```bash
# 可视化界面
npm run db:studio

# 直接连接数据库（需要安装 psql）
docker compose exec db psql -U portfolio -d portfolio

# 在 psql 中：
SELECT * FROM blog_posts;
SELECT * FROM admins;
\dt    -- 列出所有表
\q     -- 退出
```

---

## 7. 项目特有的配置文件

### 7.1 next.config.ts

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,  // 指定项目根目录（解决上层 package-lock.json 干扰）
  },
};

export default nextConfig;
```

### 7.2 prisma.config.ts

```tsx
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
});
```

### 7.3 数据库种子脚本 (`prisma/seed.ts`)

种子脚本用于填充初始数据（管理员账号、简历信息等）：

```tsx
// 创建管理员（密码会被哈希）
const password = await hash("change-me-immediately", 12);
await prisma.admin.upsert({
  where: { email: "chenzhennba@gmail.com" },
  update: {},     // 已存在则不更新
  create: {       // 不存在则创建
    email: "chenzhennba@gmail.com",
    name: "Zhen Chen",
    password,
  },
});
```

`upsert` = update + insert：有就跳过，没有就创建。保证脚本可以重复执行。

---

## 8. 与 iOS 开发环境的核心差异总结

| 维度 | iOS (Xcode) | Web (Next.js) |
|------|-------------|---------------|
| IDE | Xcode（一体化） | VS Code + 终端（各司其职） |
| 编译 | Xcode 编译 Swift | Next.js + Turbopack 编译 TS |
| 热重载 | SwiftUI Preview | 保存即刷新 |
| 调试 | Xcode Debugger | 浏览器 DevTools |
| 依赖管理 | SPM / CocoaPods | npm |
| 运行 | Simulator / 真机 | 浏览器 |
| 部署 | App Store | Vercel / 云服务器 |
| 数据库 | Core Data / SQLite | PostgreSQL + Prisma |
| 网络 | URLSession | fetch() |
| 布局 | Auto Layout / SwiftUI | CSS / Tailwind |
| 动画 | Core Animation / SwiftUI | CSS Transitions / Motion |
| 状态管理 | @State / @Observable | useState / useEffect |
| 路由 | NavigationStack | 文件系统路由 |
| 认证 | Keychain | Cookie + JWT |

---

## 目录

- [第一部分：架构概览](./tutorial-01-overview.md)
- [第二部分：前端详解 — React、组件、样式](./tutorial-02-frontend.md)
- [第三部分：后端详解 — API、数据库、认证](./tutorial-03-backend.md)
- [第四部分：开发工具与命令行](./tutorial-04-tooling.md)（本文）
