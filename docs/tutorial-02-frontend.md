# iOS 开发者的全栈 Web 教程 — 第二部分：前端详解

---

## 1. React 基础 — 用 SwiftUI 类比

### 1.1 组件 = View

SwiftUI:
```swift
struct Greeting: View {
    let name: String
    var body: some View {
        Text("Hello, \(name)")
    }
}
```

React (TSX):
```tsx
function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}
```

**关键差异：**
- Swift 用 `struct`，React 用 `function`
- Swift 用 `let name: String`，React 用 `{ name }: { name: string }` （props）
- Swift 用 `body: some View {}`，React 直接 `return` JSX
- JSX 看起来像 HTML，但实际上是 JavaScript 表达式

### 1.2 状态管理 — @State vs useState

SwiftUI:
```swift
struct Counter: View {
    @State private var count = 0
    var body: some View {
        Button("Count: \(count)") {
            count += 1
        }
    }
}
```

React:
```tsx
"use client"; // 有状态的组件必须是 Client Component
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  //     ↑值     ↑setter     ↑Hook   ↑初始值

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**关键差异：**
- `@State var count = 0` → `const [count, setCount] = useState(0)`
- 不能直接修改 `count`，必须通过 `setCount()` 修改
- `{ }` 在 JSX 中表示插入 JavaScript 表达式（类似 SwiftUI 的 `\()`）

### 1.3 副作用 — onAppear vs useEffect

SwiftUI:
```swift
struct ProfileView: View {
    @State private var profile: Profile?

    var body: some View {
        Text(profile?.name ?? "Loading...")
            .onAppear {
                Task {
                    profile = await fetchProfile()
                }
            }
    }
}
```

React:
```tsx
"use client";
import { useState, useEffect } from "react";

function ProfileView() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // 组件首次渲染后执行（等同于 onAppear）
    fetch("/api/resume/profile")
      .then(r => r.json())
      .then(data => setProfile(data));
  }, []); // ← 空数组表示只执行一次

  return <p>{profile?.name ?? "Loading..."}</p>;
}
```

**`useEffect` 的第二个参数（依赖数组）：**
- `[]` — 只在组件挂载时执行一次（= `onAppear`）
- `[userId]` — `userId` 变化时重新执行（= `.onChange(of: userId)`）
- 不传 — 每次渲染都执行（几乎不用）

### 1.4 条件渲染

SwiftUI:
```swift
if isLoggedIn {
    Text("Welcome")
} else {
    Text("Please login")
}
```

React (JSX):
```tsx
{isLoggedIn ? <p>Welcome</p> : <p>Please login</p>}

// 或者只显示/隐藏
{error && <p className="text-red-400">{error}</p>}
```

### 1.5 列表渲染 — ForEach vs map

SwiftUI:
```swift
ForEach(posts) { post in
    Text(post.title)
}
```

React:
```tsx
{posts.map(post => (
  <p key={post.id}>{post.title}</p>
))}
```

**注意**：React 的列表每个元素必须有唯一的 `key` 属性（类似 SwiftUI 的 `Identifiable`）。

---

## 2. Next.js 路由 — 文件即路由

Next.js 使用 **文件系统路由**，文件路径就是 URL 路径：

```
文件路径                                    URL
─────────────────────────────────────      ─────────────────
src/app/page.tsx                          /
src/app/(public)/blog/page.tsx            /blog
src/app/(public)/blog/[slug]/page.tsx     /blog/my-first-post
src/app/(admin)/admin/page.tsx            /admin
src/app/(admin)/admin/blog/new/page.tsx   /admin/blog/new
src/app/(admin)/admin/blog/[id]/page.tsx  /admin/blog/abc123
```

### 路由规则

| 文件/目录名 | 含义 | iOS 类比 |
|------------|------|----------|
| `page.tsx` | 这个路径的页面内容 | 一个 ViewController |
| `layout.tsx` | 包裹子页面的布局 | NavigationView / TabView |
| `loading.tsx` | 加载状态 UI | ProgressView |
| `not-found.tsx` | 404 页面 | — |
| `(admin)/` | 路由组，不影响 URL | 纯粹的代码组织 |
| `[slug]/` | 动态路由参数 | 类似 `/blog/:slug` |
| `api/` | API 路由（后端接口） | Vapor/Express 路由 |

### 圆括号路由组 `(admin)` 和 `(public)`

```
src/app/
├── (admin)/admin/page.tsx    → URL: /admin     （不是 /admin/admin）
├── (public)/blog/page.tsx    → URL: /blog      （不是 /public/blog）
```

`(admin)` 和 `(public)` 的圆括号表示**不参与 URL**，只是用来组织代码。
这样 admin 页面和公开页面可以用不同的 `layout.tsx`。

### 方括号动态路由 `[slug]` 和 `[id]`

```tsx
// src/app/(public)/blog/[slug]/page.tsx
// 访问 /blog/my-first-post 时，slug = "my-first-post"

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  // ...
}
```

**iOS 类比**：类似 SwiftUI 的 `NavigationLink(value: post.slug)`，然后在目标页面通过参数获取数据。

### Layout 布局嵌套

```
src/app/layout.tsx              ← 根 Layout（所有页面共享）
├── src/app/(admin)/admin/layout.tsx  ← Admin Layout（侧边栏）
│   ├── admin/page.tsx                  ← 被 Admin Layout 包裹
│   ├── admin/blog/page.tsx             ← 被 Admin Layout 包裹
│   └── admin/resume/page.tsx           ← 被 Admin Layout 包裹
└── src/app/(public)/blog/page.tsx    ← 只有根 Layout
```

**iOS 类比**：
```swift
// 根 Layout = 最外层的 NavigationStack
// Admin Layout = TabView 或 SplitView
// page.tsx = 具体的页面内容

NavigationStack {           // ← layout.tsx（根）
    SplitView {             // ← admin/layout.tsx
        Sidebar()           // ← AdminSidebar
        DetailView()        // ← page.tsx（内容）
    }
}
```

---

## 3. 组件系统详解

### 3.1 UI 基础组件 (`src/components/ui/`)

这些组件类似 iOS 的系统控件封装：

#### Button.tsx — 按钮组件

```tsx
// 使用方式：
<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost">Delete</Button>
```

**实现原理：**
```tsx
// variant 和 size 通过 props 传入，映射到不同的 CSS class
const variants = {
  primary: "bg-gradient-to-r from-accent to-purple-500 text-white ...",
  secondary: "glass hover:bg-white/10 text-foreground",
  ghost: "text-muted hover:text-foreground hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};
```

**iOS 类比**：
```swift
// 类似于自定义 ButtonStyle
struct PrimaryButtonStyle: ButtonStyle { ... }
struct SecondaryButtonStyle: ButtonStyle { ... }
```

#### forwardRef 是什么？

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={...} {...props} />;
  }
);
```

`forwardRef` 允许父组件获取这个按钮的 DOM 引用。
**iOS 类比**：类似 SwiftUI 的 `PreferenceKey`，让父 View 能访问子 View 的信息。

#### `...props` 展开运算符

```tsx
// ...props 把所有没有解构的属性原样传给 <button>
// 比如 onClick, disabled, type 等
<Button onClick={save} disabled={loading} type="submit">
  Save
</Button>
// → <button onClick={save} disabled={loading} type="submit" className="...">Save</button>
```

### 3.2 布局组件 (`src/components/layout/`)

#### Navbar.tsx — 导航栏

核心功能：
1. **滚动隐藏**：向下滚动时隐藏，向上滚动时显示
2. **毛玻璃效果**：滚动后背景变为半透明毛玻璃
3. **移动端汉堡菜单**：小屏幕显示汉堡图标，点击展开菜单

```tsx
const { scrollY } = useScroll();  // motion 库提供的滚动位置

useMotionValueEvent(scrollY, "change", (latest) => {
  const prev = scrollY.getPrevious() ?? 0;
  setHidden(latest > prev && latest > 150);  // 向下滚动超过150px时隐藏
  setScrolled(latest > 50);                   // 滚动超过50px时加毛玻璃
});
```

**iOS 类比**：类似 UIKit 的 `UIScrollViewDelegate`，监听 `scrollViewDidScroll`。

#### 响应式设计 — 用 CSS class 控制

```tsx
{/* 桌面端显示，移动端隐藏 */}
<ul className="hidden md:flex items-center gap-8">

{/* 移动端显示，桌面端隐藏 */}
<button className="md:hidden p-2">
```

`md:` 前缀表示 "当屏幕宽度 >= 768px 时"：
- `hidden md:flex` = 默认隐藏，md 以上显示为 flex
- `md:hidden` = md 以上隐藏

**iOS 类比**：类似 `@Environment(\.horizontalSizeClass)` 判断 compact/regular。

### 3.3 Admin 组件 (`src/components/admin/`)

#### AdminSidebar.tsx — 管理后台侧边栏

```tsx
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/resume", label: "Resume", icon: User },
  { href: "/admin/uploads", label: "Media", icon: Image },
];
```

**iOS 类比**：相当于 `TabView` 或 iPad 的 `NavigationSplitView` 的 sidebar。

导航高亮逻辑：
```tsx
const isActive =
  pathname === item.href ||
  (item.href !== "/admin" && pathname.startsWith(item.href));
// /admin/blog/new → "Blog" 高亮
// /admin → "Dashboard" 高亮
```

#### RichTextEditor.tsx — 富文本编辑器

使用 TipTap 库（基于 ProseMirror），提供所见即所得的编辑体验：

```tsx
const editor = useEditor({
  extensions: [
    StarterKit,          // 基础功能（加粗、斜体、列表等）
    Image,               // 图片插入
    Youtube,             // YouTube 视频嵌入
    Link,                // 超链接
  ],
  content,               // 初始 HTML 内容
  immediatelyRender: false, // 避免 SSR 水合错误
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML()); // 内容变化时回调
  },
});
```

**iOS 类比**：类似 `UITextView` + `NSAttributedString`，但功能更丰富。

---

## 4. Tailwind CSS — 样式系统

### 4.1 核心理念

Tailwind 不写传统 CSS 文件，而是在 HTML/JSX 中直接用 class name 描述样式。

**传统 CSS：**
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

**Tailwind：**
```tsx
<div className="bg-white rounded-xl p-4 shadow-md">
```

### 4.2 常用 class 对照表

| Tailwind Class | CSS 效果 | iOS 类比 |
|---------------|----------|----------|
| `p-4` | padding: 16px | `.padding(16)` |
| `px-6` | padding-left/right: 24px | `.padding(.horizontal, 24)` |
| `m-2` | margin: 8px | 外部 spacing |
| `text-sm` | font-size: 14px | `.font(.subheadline)` |
| `text-xl` | font-size: 20px | `.font(.title3)` |
| `font-bold` | font-weight: bold | `.fontWeight(.bold)` |
| `rounded-xl` | border-radius: 12px | `.cornerRadius(12)` |
| `bg-white` | background: white | `.background(.white)` |
| `text-red-400` | color: #f87171 | `.foregroundColor(.red)` |
| `flex` | display: flex | `HStack` / `VStack` |
| `gap-4` | gap: 16px | `.spacing(16)` in Stack |
| `grid grid-cols-2` | 2列网格 | `LazyVGrid(columns: 2)` |
| `w-full` | width: 100% | `.frame(maxWidth: .infinity)` |
| `hidden` | display: none | 条件渲染 |
| `hover:bg-white/10` | 悬停时半透明白色背景 | — （Web 特有） |
| `transition-colors` | 颜色变化有动画 | `.animation(.default)` |
| `cursor-pointer` | 鼠标变成手指 | — （Web 特有） |

### 4.3 响应式前缀

```
sm:   640px+   (大手机横屏)
md:   768px+   (平板竖屏)
lg:   1024px+  (平板横屏/小笔记本)
xl:   1280px+  (桌面)
2xl:  1536px+  (大屏幕)
```

示例：
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```
- 手机：1列
- 平板：2列
- 桌面：3列

### 4.4 项目中的自定义样式 (`globals.css`)

```css
@theme {
  --color-background: #0a0a0a;    /* 深黑背景 */
  --color-foreground: #f5f5f5;    /* 浅色文字 */
  --color-accent: #6366f1;        /* 强调色（紫蓝色） */
  --color-muted: #a1a1aa;         /* 弱化文字 */
}
```

然后可以用 `bg-background`、`text-accent`、`text-muted` 等来引用。

### 4.5 cn() 工具函数

```tsx
import { cn } from "@/lib/utils";

// cn() 合并 CSS class，处理冲突
<button className={cn(
  "px-4 py-2 rounded-xl",           // 基础样式
  isActive ? "bg-accent" : "bg-gray", // 条件样式
  className                           // 外部传入的样式
)}>
```

**iOS 类比**：类似根据条件动态选择 modifier：
```swift
.background(isActive ? Color.accent : Color.gray)
```

---

## 5. 动画 — Motion 库

项目使用 `motion` 库（Framer Motion）做动画，API 设计和 SwiftUI 的动画理念很像：

```tsx
import { motion } from "motion/react";

// 导航栏滚动隐藏动画
<motion.header
  animate={{ y: hidden ? "-100%" : "0%" }}  // 目标状态
  transition={{ duration: 0.3 }}             // 动画时长
>
```

**iOS 类比**：
```swift
withAnimation(.easeInOut(duration: 0.3)) {
    offset.y = hidden ? -headerHeight : 0
}
```

---

## 6. 图标 — Lucide React

项目使用 `lucide-react` 图标库，用法和 SF Symbols 类似：

```tsx
import { Save, Trash2, Plus } from "lucide-react";

<Save size={16} />           // 16px 大小的保存图标
<Trash2 size={14} />         // 14px 大小的删除图标
<Plus className="text-accent" size={14} />  // 带颜色的加号图标
```

**iOS 类比**：
```swift
Image(systemName: "square.and.arrow.down") // SF Symbol
    .font(.system(size: 16))
```

---

## 7. 实际页面解析

### 7.1 Admin 登录页 (`src/app/(admin)/admin/login/page.tsx`)

```tsx
"use client";  // ← Client Component，因为有表单交互

export default function LoginPage() {
  const router = useRouter();          // Next.js 路由器（用于跳转）
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // 阻止表单默认提交行为（Web 特有）
    setLoading(true);

    // 发送登录请求（类似 URLSession）
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/admin");  // 登录成功，跳转到 Admin 首页
    } else {
      setError(data.error);   // 显示错误信息
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>   {/* HTML 表单 */}
      {error && <div className="text-red-400">{error}</div>}
      <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
```

**iOS 对比**：
```swift
struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var error = ""
    @State private var loading = false

    var body: some View {
        Form {
            TextField("Email", text: $email)
            SecureField("Password", text: $password)
            Button(loading ? "Signing in..." : "Sign In") {
                Task { await login() }
            }
        }
    }
}
```

### 7.2 公开博客列表页 (`src/app/(public)/blog/page.tsx`)

```tsx
// 没有 "use client" → Server Component
// 代码在服务端执行，直接查数据库

export default async function BlogPage() {
  // 直接用 Prisma 查数据库（不需要 API 请求！）
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
```

**关键点**：Server Component 可以直接访问数据库，不需要经过 API 层！这是 Next.js 的一大优势。

---

## 下一部分

- [第三部分：后端详解 — API、数据库、认证](./tutorial-03-backend.md)
