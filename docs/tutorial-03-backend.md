# iOS 开发者的全栈 Web 教程 — 第三部分：后端详解

---

## 1. API Routes — 后端接口

Next.js 的 API Routes 让你在同一个项目里写后端代码，不需要单独的服务器。

### 1.1 文件即接口

```
文件路径                              HTTP 接口
────────────────────────────────     ──────────────────────
src/app/api/auth/login/route.ts  →  POST /api/auth/login
src/app/api/blog/route.ts        →  GET/POST /api/blog
src/app/api/blog/[id]/route.ts   →  GET/PUT/DELETE /api/blog/:id
src/app/api/upload/route.ts      →  GET/POST/DELETE /api/upload
```

### 1.2 route.ts 的结构

每个 `route.ts` 导出 HTTP 方法对应的函数：

```tsx
// src/app/api/blog/route.ts

// GET /api/blog — 获取博客列表
export async function GET(request: Request) {
  const posts = await prisma.blogPost.findMany();
  return NextResponse.json({ success: true, data: posts });
}

// POST /api/blog — 创建新博客
export async function POST(request: Request) {
  const body = await request.json();
  const post = await prisma.blogPost.create({ data: body });
  return NextResponse.json({ success: true, data: post }, { status: 201 });
}
```

**iOS 类比**：

如果你用 Vapor（Swift 后端框架），等价的代码是：
```swift
// Vapor
app.get("api", "blog") { req -> [BlogPost] in
    return try await BlogPost.query(on: req.db).all()
}

app.post("api", "blog") { req -> BlogPost in
    let input = try req.content.decode(CreateBlogInput.self)
    let post = BlogPost(title: input.title, ...)
    try await post.save(on: req.db)
    return post
}
```

### 1.3 动态路由参数

```tsx
// src/app/api/blog/[id]/route.ts
// 访问 /api/blog/abc123 时，id = "abc123"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: post });
}
```

### 1.4 请求和响应

```tsx
// 读取 JSON body
const body = await request.json();

// 读取 URL 查询参数 (?status=PUBLISHED&tag=swift)
const { searchParams } = new URL(request.url);
const status = searchParams.get("status");  // "PUBLISHED"
const tag = searchParams.get("tag");        // "swift"

// 读取 FormData（文件上传）
const formData = await request.formData();
const file = formData.get("file") as File;

// 返回 JSON 响应
return NextResponse.json(
  { success: true, data: post },  // body
  { status: 201 }                  // HTTP 状态码
);

// 常用状态码：
// 200 OK — 成功
// 201 Created — 创建成功
// 400 Bad Request — 请求参数错误
// 401 Unauthorized — 未登录
// 404 Not Found — 资源不存在
// 409 Conflict — 冲突（如 slug 重复）
// 500 Internal Server Error — 服务器内部错误
```

### 1.5 完整的 API 接口清单

| 方法 | 路径 | 功能 | 需要登录 |
|------|------|------|---------|
| POST | `/api/auth/login` | 管理员登录 | 否 |
| POST | `/api/auth/logout` | 管理员登出 | 否 |
| GET | `/api/auth/me` | 获取当前用户信息 | 是 |
| GET | `/api/blog` | 获取博客列表 | 否（只返回已发布） |
| POST | `/api/blog` | 创建博客 | 是 |
| GET | `/api/blog/[id]` | 获取单篇博客 | 否 |
| PUT | `/api/blog/[id]` | 更新博客 | 是 |
| DELETE | `/api/blog/[id]` | 删除博客 | 是 |
| GET | `/api/projects` | 获取项目列表 | 否 |
| POST | `/api/projects` | 创建项目 | 是 |
| GET | `/api/projects/[id]` | 获取单个项目 | 否 |
| PUT | `/api/projects/[id]` | 更新项目 | 是 |
| DELETE | `/api/projects/[id]` | 删除项目 | 是 |
| GET | `/api/resume/profile` | 获取个人资料 | 否 |
| PUT | `/api/resume/profile` | 更新个人资料 | 是 |
| GET/POST | `/api/resume/experience` | 经历列表/新增 | POST 需要 |
| PUT/DELETE | `/api/resume/experience/[id]` | 更新/删除经历 | 是 |
| GET/POST | `/api/resume/education` | 教育列表/新增 | POST 需要 |
| PUT/DELETE | `/api/resume/education/[id]` | 更新/删除教育 | 是 |
| GET/POST | `/api/resume/skills` | 技能列表/新增 | POST 需要 |
| PUT/DELETE | `/api/resume/skills/[id]` | 更新/删除技能 | 是 |
| GET | `/api/upload` | 获取上传文件列表 | 是 |
| POST | `/api/upload` | 上传文件 | 是 |
| DELETE | `/api/upload` | 删除文件 | 是 |

---

## 2. 数据库 — Prisma + PostgreSQL

### 2.1 什么是 ORM

ORM（Object-Relational Mapping）把数据库表映射成代码中的对象。

**iOS 类比**：
- Prisma ≈ Core Data / SwiftData
- `schema.prisma` ≈ `.xcdatamodeld`（数据模型文件）
- `prisma.blogPost.findMany()` ≈ `@FetchRequest` 或 `modelContext.fetch()`

### 2.2 Schema 定义 (`prisma/schema.prisma`)

```prisma
model BlogPost {
  id          String     @id @default(cuid())     // 主键，自动生成唯一 ID
  title       String                                // 必填字段
  slug        String     @unique                    // 唯一约束（URL 友好的标识）
  excerpt     String     @default("")               // 有默认值
  content     String     @default("")
  coverImage  String?    @map("cover_image")        // 可选字段 + 列名映射
  tags        String[]   @default([])               // 字符串数组
  status      PostStatus @default(DRAFT)            // 枚举类型 + 默认值
  publishedAt DateTime?  @map("published_at")       // 可选日期
  createdAt   DateTime   @default(now())            // 自动设为当前时间
  updatedAt   DateTime   @updatedAt                 // 自动更新时间戳

  @@index([status])                                 // 数据库索引（加速查询）
  @@index([slug])
  @@map("blog_posts")                               // 数据库表名
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**等价的 Swift 代码（SwiftData）：**
```swift
@Model
class BlogPost {
    @Attribute(.unique) var id: String
    var title: String
    @Attribute(.unique) var slug: String
    var excerpt: String = ""
    var content: String = ""
    var coverImage: String?
    var tags: [String] = []
    var status: PostStatus = .draft
    var publishedAt: Date?
    var createdAt: Date = .now
    var updatedAt: Date = .now
}

enum PostStatus: String, Codable {
    case draft = "DRAFT"
    case published = "PUBLISHED"
    case archived = "ARCHIVED"
}
```

### 2.3 Prisma 常用操作

```tsx
// 查询多条记录（SELECT * FROM blog_posts WHERE status = 'PUBLISHED'）
const posts = await prisma.blogPost.findMany({
  where: { status: "PUBLISHED" },
  orderBy: { createdAt: "desc" },
});

// 查询单条记录（SELECT * FROM blog_posts WHERE id = 'xxx'）
const post = await prisma.blogPost.findUnique({
  where: { id: "xxx" },
});

// 创建记录（INSERT INTO blog_posts ...）
const newPost = await prisma.blogPost.create({
  data: {
    title: "My Post",
    slug: "my-post",
    status: "DRAFT",
  },
});

// 更新记录（UPDATE blog_posts SET title = '...' WHERE id = 'xxx'）
const updated = await prisma.blogPost.update({
  where: { id: "xxx" },
  data: { title: "Updated Title" },
});

// 删除记录（DELETE FROM blog_posts WHERE id = 'xxx'）
await prisma.blogPost.delete({
  where: { id: "xxx" },
});

// 计数（SELECT COUNT(*) FROM blog_posts）
const count = await prisma.blogPost.count();

// upsert — 有就更新，没有就创建
await prisma.admin.upsert({
  where: { email: "admin@example.com" },
  update: { name: "New Name" },
  create: { email: "admin@example.com", name: "Admin", password: "..." },
});
```

**iOS 对比（SwiftData）：**
```swift
// 查询
let posts = try modelContext.fetch(
    FetchDescriptor<BlogPost>(
        predicate: #Predicate { $0.status == .published },
        sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
    )
)

// 创建
let post = BlogPost(title: "My Post", slug: "my-post")
modelContext.insert(post)

// 删除
modelContext.delete(post)
```

### 2.4 Prisma Client 单例 (`src/lib/prisma.ts`)

```tsx
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**为什么这样写？** Next.js 开发模式下会频繁热重载，每次重载都会创建新的 PrismaClient 实例，最终耗尽数据库连接。把实例存在 `globalThis` 上可以复用。

**iOS 类比**：类似单例模式 `static let shared = DatabaseManager()`。

### 2.5 数据库迁移

```bash
# 修改 schema.prisma 后，同步到数据库
npm run db:push      # 开发环境：直接推送 schema 变更（可能丢数据）
npm run db:migrate   # 生产环境：生成迁移文件，安全地变更

# 重新生成 Prisma Client（schema 变更后必须执行）
npm run db:generate

# 填充初始数据
npm run db:seed

# 可视化数据库管理工具（浏览器中打开）
npm run db:studio
```

---

## 3. 认证系统 — JWT

### 3.1 什么是 JWT

JWT（JSON Web Token）是一种无状态的认证方式：
1. 用户登录成功 → 服务器生成一个加密 token
2. Token 存在浏览器 Cookie 中
3. 每次请求自动携带 Cookie → 服务器验证 token → 确认身份

**iOS 类比**：
- JWT ≈ Keychain 里存的 access token
- Cookie ≈ `HTTPCookieStorage`
- 服务端验证 ≈ API 中间件检查 `Authorization` header

### 3.2 认证流程图

```
登录流程：
┌──────────┐    POST /api/auth/login     ┌──────────┐
│          │  ─────────────────────────→  │          │
│  浏览器   │    { email, password }      │  服务器   │
│          │  ←─────────────────────────  │          │
│          │    Set-Cookie: auth-token=   │          │
│          │    eyJhbGciOiJIUzI1NiJ9...  │          │
└──────────┘                              └──────────┘

后续请求（自动携带 Cookie）：
┌──────────┐    GET /api/blog            ┌──────────┐
│          │  ─────────────────────────→  │          │
│  浏览器   │    Cookie: auth-token=...  │  服务器   │
│          │  ←─────────────────────────  │          │
│          │    { success: true, data }  │          │
└──────────┘                              └──────────┘
```

### 3.3 认证代码详解 (`src/lib/auth.ts`)

```tsx
import { SignJWT, jwtVerify } from "jose";  // JWT 库
import { hash, compare } from "bcryptjs";    // 密码哈希库

// JWT 密钥（从环境变量读取）
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

// 创建 JWT token
export async function signToken(payload: { userId: string; email: string }) {
  return new SignJWT(payload)            // 载荷（用户信息）
    .setProtectedHeader({ alg: "HS256" }) // 签名算法
    .setExpirationTime("7d")              // 7天后过期
    .setIssuedAt()                        // 签发时间
    .sign(JWT_SECRET);                    // 用密钥签名
}

// 验证当前请求是否已登录
export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;  // 没有 token → 未登录

  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;  // 返回用户信息 { userId, email }
}

// 密码哈希（存储时用）
export async function hashPassword(password: string) {
  return hash(password, 12);  // 12轮加盐哈希
  // "password123" → "$2a$12$LJ3m4..." （不可逆）
}

// 密码验证（登录时用）
export async function verifyPassword(password: string, hashed: string) {
  return compare(password, hashed);  // true/false
}
```

**iOS 类比**：
```swift
// 类似 iOS 中的 token 管理
class AuthManager {
    static let shared = AuthManager()

    func saveToken(_ token: String) {
        KeychainHelper.save(token, forKey: "auth-token")
    }

    func getToken() -> String? {
        KeychainHelper.get(forKey: "auth-token")
    }

    func isAuthenticated() -> Bool {
        guard let token = getToken() else { return false }
        return JWTDecoder.isValid(token)
    }
}
```

### 3.4 登录 API (`src/app/api/auth/login/route.ts`)

```tsx
export async function POST(request: Request) {
  const body = await request.json();

  // 1. 验证输入格式
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return error(400);

  // 2. 查找用户
  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email }
  });
  if (!admin) return error(401, "Invalid credentials");

  // 3. 验证密码
  const valid = await verifyPassword(parsed.data.password, admin.password);
  if (!valid) return error(401, "Invalid credentials");

  // 4. 生成 JWT 并设置 Cookie
  const token = await signToken({ userId: admin.id, email: admin.email });
  const cookieStore = await cookies();
  cookieStore.set(getAuthCookieConfig(token));

  // 5. 返回成功
  return NextResponse.json({ success: true, data: { user: admin } });
}
```

### 3.5 路由守卫 — Middleware (`src/middleware.ts`)

```tsx
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护 /admin/* 路由（登录页除外）
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("auth-token")?.value;

    if (!token || !(await verifyToken(token))) {
      // 未登录或 token 无效 → 重定向到登录页
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next(); // 放行
}

// 只对 /admin/* 路径生效
export const config = {
  matcher: ["/admin/:path*"],
};
```

**iOS 类比**：类似 `UINavigationController` 的拦截器，或者 Coordinator 模式中在跳转前检查登录状态：
```swift
func navigate(to route: Route) {
    guard authManager.isAuthenticated() else {
        present(LoginViewController())
        return
    }
    push(route.viewController)
}
```

---

## 4. 数据验证 — Zod

Zod 用于验证 API 收到的数据格式是否正确。

### 4.1 为什么需要验证？

API 是对外暴露的接口，任何人都可以发送请求。你不能信任客户端发来的数据。

```tsx
// 没有验证 → 危险！
const body = await request.json();
await prisma.blogPost.create({ data: body }); // body 里可能有恶意数据

// 有验证 → 安全
const parsed = createBlogSchema.safeParse(body);
if (!parsed.success) return error(400, "Invalid data");
await prisma.blogPost.create({ data: parsed.data }); // parsed.data 是安全的
```

### 4.2 Schema 定义 (`src/validators/blog.ts`)

```tsx
import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(1),                           // 必填字符串，至少1个字符
  slug: z.string().min(1),                             // 必填
  excerpt: z.string().optional().default(""),           // 可选，默认空字符串
  content: z.string().optional().default(""),
  coverImage: z.string().optional().nullable(),         // 可选，可以是 null
  tags: z.array(z.string()).optional().default([]),     // 字符串数组，默认空
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
});
```

**iOS 类比（Codable + 验证）：**
```swift
struct CreateBlogInput: Codable {
    let title: String       // 必填
    let slug: String        // 必填
    var excerpt: String = "" // 有默认值
    var coverImage: String?  // 可选
    var tags: [String] = []
    var status: PostStatus = .draft

    func validate() throws {
        guard !title.isEmpty else { throw ValidationError.required("title") }
        guard !slug.isEmpty else { throw ValidationError.required("slug") }
    }
}
```

### 4.3 safeParse vs parse

```tsx
// safeParse — 不抛异常，返回结果对象（推荐）
const result = schema.safeParse(data);
if (!result.success) {
  console.log(result.error.issues); // 验证错误详情
} else {
  console.log(result.data); // 验证通过的数据
}

// parse — 验证失败直接抛异常
const data = schema.parse(data); // 可能抛 ZodError
```

---

## 5. 文件上传

### 5.1 上传流程

```
浏览器                        服务器                      磁盘
──────                       ──────                     ──────
选择文件
  │
  ├─ FormData { file: File }
  │  POST /api/upload ──────→ 验证登录
  │                           验证文件（大小、类型）
  │                           生成唯一文件名 ──────────→ 保存到 public/uploads/
  │                           写入 Upload 表
  │  ←────────────────────── { url: "/uploads/1234-abc.pdf" }
  │
  │  把 url 存到对应记录
  │  PUT /api/resume/profile
  │  { resumeUrl: "/uploads/1234-abc.pdf" }
```

### 5.2 文件保存逻辑 (`src/lib/upload.ts`)

```tsx
export async function saveUpload(file: File) {
  // 确保上传目录存在
  await mkdir(UPLOAD_DIR, { recursive: true });

  // 生成唯一文件名（避免冲突）
  const ext = path.extname(file.name);  // ".pdf"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  // → "1708000000-a1b2c3.pdf"

  // 写入磁盘
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // 记录到数据库
  const upload = await prisma.upload.create({
    data: {
      filename: file.name,    // 原始文件名
      url: `/uploads/${filename}`,  // 访问路径
      mimeType: file.type,    // "application/pdf"
      size: file.size,        // 文件大小（字节）
    },
  });

  return upload;
}
```

**iOS 类比**：类似上传图片到服务器：
```swift
var request = URLRequest(url: uploadURL)
request.httpMethod = "POST"
let boundary = UUID().uuidString
request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
// ... 构造 multipart body
```

---

## 6. Cookie 工作原理

Cookie 是 Web 中在浏览器和服务器之间自动传递的小段数据。

```
浏览器 Cookie 存储
┌─────────────────────────────────────┐
│  name: "auth-token"                 │
│  value: "eyJhbGciOiJIUzI1NiJ9..."  │ ← JWT token
│  httpOnly: true                     │ ← JavaScript 无法读取（防 XSS）
│  secure: true                       │ ← 只通过 HTTPS 传输
│  sameSite: "strict"                 │ ← 不随跨站请求发送（防 CSRF）
│  path: "/"                          │ ← 所有路径都携带
│  maxAge: 604800                     │ ← 7天后过期
└─────────────────────────────────────┘
```

**每次请求浏览器自动带上**：
```
GET /api/blog HTTP/1.1
Cookie: auth-token=eyJhbGciOiJIUzI1NiJ9...
```

**iOS 类比**：类似 `URLSession` 的 `HTTPCookieStorage.shared`，iOS 的 `URLSession` 也会自动管理 Cookie。

---

## 下一部分

- [第四部分：开发工具与命令行](./tutorial-04-tooling.md)
