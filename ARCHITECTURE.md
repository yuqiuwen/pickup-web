# 架构说明文档

## 核心设计理念

这是一个基于 **Next.js 15+ App Router** 的现代化前端架构，遵循以下原则：

1. **文件系统路由** - 使用 Next.js 的文件系统路由，不需要额外配置
2. **全局中间件认证** - 使用 `middleware.ts` 做统一的路由拦截和权限控制
3. **配置化菜单** - 菜单配置与路由解耦，支持动态权限过滤
4. **分层架构** - 清晰的代码组织和职责划分

## 一、路由系统

### 1.1 文件系统路由

Next.js 使用文件系统作为路由，这是默认且推荐的方式：

```
app/
├── (main)/              # 路由组：需要认证的页面
│   ├── page.tsx        # 对应路由: /
│   ├── pickup/
│   │   └── page.tsx    # 对应路由: /pickup
│   ├── anniversary/
│   │   └── page.tsx    # 对应路由: /anniversary
│   └── profile/
│       └── page.tsx    # 对应路由: /profile
│
└── auth/               # 路由组：不需要认证的页面
    ├── login/
    │   └── page.tsx    # 对应路由: /auth/login
    └── register/
        └── page.tsx    # 对应路由: /auth/register
```

**关键点**：
- `(main)` 和 `auth` 是**路由组**（Route Groups），用括号包裹的文件夹不会成为 URL 的一部分
- 只有包含 `page.tsx` 的文件夹才会生成路由
- 路由组用于组织代码，不影响 URL 结构

### 1.2 为什么使用路由组？

```typescript
// ❌ 不使用路由组
app/
├── home/page.tsx          → /home
├── pickup/page.tsx        → /pickup
└── login/page.tsx         → /login

// ✅ 使用路由组
app/
├── (main)/
│   ├── page.tsx          → /
│   └── pickup/page.tsx   → /pickup
└── auth/
    └── login/page.tsx    → /auth/login
```

路由组的好处：
1. **逻辑分组** - 将需要认证和不需要认证的页面分开
2. **共享布局** - 每个路由组可以有自己的 `layout.tsx`
3. **不影响 URL** - 括号内的名称不会出现在 URL 中

## 二、认证系统

### 2.1 全局认证拦截 (middleware.ts)

**核心设计**：使用 Next.js 中间件在服务端做全局路由拦截

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  
  // 公开路径：无需认证
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // 受保护路径：检查 token
  if (protectedPaths.includes(pathname)) {
    if (!token) {
      // 重定向到登录页
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**优势**：
1. ✅ **统一拦截** - 所有路由在服务端统一验证，无需每个页面重复代码
2. ✅ **性能更好** - 在服务端拦截，避免页面加载后再跳转
3. ✅ **更安全** - 服务端验证，无法绕过
4. ✅ **代码简洁** - 页面组件不需要关心认证逻辑

### 2.2 客户端状态管理 (AuthContext)

虽然有全局中间件，但客户端仍需要：

```typescript
// contexts/auth-context.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // 初始化时获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const token = request.getAccessToken();
      if (token) {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      }
    };
    initAuth();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**用途**：
- 存储用户信息（用户名、角色等）
- 提供登录/登出方法
- 菜单权限过滤

### 2.3 认证流程

```
用户访问页面
    ↓
middleware.ts 拦截
    ↓
检查 cookie 中的 token
    ↓
┌─────────────┬─────────────┐
│  有 token    │  无 token    │
│    ↓        │    ↓        │
│  放行       │  重定向登录  │
└─────────────┴─────────────┘
    ↓
页面加载
    ↓
AuthContext 初始化
    ↓
获取用户信息
    ↓
渲染页面内容
```

## 三、菜单系统

### 3.1 菜单配置与路由的关系

**重要概念**：菜单配置和路由是**解耦**的

```typescript
// config/menu.ts - 菜单配置
export const menuConfig: MenuConfig = [
  {
    id: 'home',
    label: 'Home',
    path: '/',           // 指向实际路由
    icon: Home,
  },
  {
    id: 'pickup',
    label: 'Pickup',
    path: '/pickup',     // 指向实际路由
    icon: Package,
  },
];
```

```
路由文件系统                菜单配置
app/(main)/page.tsx    ←   { path: '/' }
app/(main)/pickup/     ←   { path: '/pickup' }
```

### 3.2 为什么要分离菜单配置？

**1. 灵活性**
```typescript
// 可以控制菜单的显示顺序，而不依赖文件系统顺序
export const menuConfig = [
  { id: 'home', path: '/', ... },
  { id: 'pickup', path: '/pickup', ... },
  // 实际路由可能有更多页面，但菜单只显示这些
];
```

**2. 权限控制**
```typescript
// 根据角色动态显示/隐藏菜单项
{
  id: 'admin',
  label: '管理面板',
  path: '/admin',
  roles: ['admin'], // 只有 admin 角色才能看到
}
```

**3. 菜单元数据**
```typescript
// 可以添加图标、徽章、分组等菜单特有的属性
{
  id: 'pickup',
  label: 'Pickup',
  path: '/pickup',
  icon: Package,        // 菜单图标
  badge: '5',           // 徽章（未读数量）
  group: 'main',        // 菜单分组
}
```

### 3.3 菜单渲染流程

```typescript
// components/layout/sidebar.tsx
export function Sidebar({ menuConfig }: SidebarProps) {
  const filteredMenu = useMenu(menuConfig); // 根据用户角色过滤
  
  return (
    <nav>
      {filteredMenu.map((item) => (
        <Link href={item.path}> {/* 使用配置的 path */}
          {item.icon && <item.icon />}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

**流程**：
```
菜单配置 → 角色过滤 → 渲染菜单项 → Link 跳转到实际路由
```

## 四、完整数据流

### 4.1 页面访问流程

```
1. 用户访问 /pickup
   ↓
2. middleware.ts 拦截
   - 检查 cookie 中的 token
   - 有 token: 继续
   - 无 token: 重定向到 /auth/login
   ↓
3. Next.js 路由系统
   - 根据文件系统找到 app/(main)/pickup/page.tsx
   - 渲染页面
   ↓
4. 页面组件加载
   - 使用 useAuth() 获取用户信息
   - 渲染 AppLayout（包含侧边栏）
   ↓
5. 侧边栏渲染
   - 读取菜单配置
   - 根据用户角色过滤菜单
   - 高亮当前路由对应的菜单项
   ↓
6. 页面完全渲染
```

### 4.2 登录流程

```
1. 用户在 /auth/login 输入凭证
   ↓
2. 调用 login() 方法
   ↓
3. 请求后端 API
   POST /api/v1/auth/login
   ↓
4. 后端返回
   - access_token
   - refresh_token (通过 cookie)
   - user 信息
   ↓
5. 前端处理
   - 存储 access_token 到 localStorage
   - 存储 access_token 到 cookie (供 middleware 使用)
   - 更新 AuthContext 中的 user 状态
   ↓
6. 跳转到首页 /
   ↓
7. middleware.ts 检查通过
   ↓
8. 渲染首页
```

## 五、目录结构说明

```
pickup-web/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 需要认证的页面路由组
│   │   ├── layout.tsx            # 共享布局（可选）
│   │   ├── page.tsx              # 首页 /
│   │   ├── pickup/page.tsx       # /pickup
│   │   ├── anniversary/page.tsx  # /anniversary
│   │   └── profile/page.tsx      # /profile
│   │
│   ├── auth/                     # 认证相关路由组
│   │   ├── layout.tsx            # 认证页面布局
│   │   ├── login/page.tsx        # /auth/login
│   │   └── register/page.tsx     # /auth/register
│   │
│   ├── layout.tsx                # 根布局（全局）
│   └── globals.css               # 全局样式
│
├── components/                   # React 组件
│   ├── layout/                   # 布局组件
│   │   ├── app-layout.tsx        # 应用主布局
│   │   ├── sidebar.tsx           # 侧边栏（渲染菜单）
│   │   └── header.tsx            # 顶部栏
│   └── ui/                       # UI 基础组件
│
├── config/                       # 配置文件
│   └── menu.ts                   # 菜单配置（与路由解耦）
│
├── contexts/                     # React Context
│   └── auth-context.tsx          # 认证状态管理
│
├── hooks/                        # 自定义 Hooks
│   └── use-menu.ts               # 菜单权限过滤
│
├── lib/                          # 工具库
│   ├── api-client.ts             # API 客户端
│   └── api/                      # API 接口定义
│
├── types/                        # TypeScript 类型
│
└── middleware.ts                 # 全局认证中间件 ⭐
```

## 六、关键设计决策

### 6.1 为什么不在每个页面写 useAuthGuard？

**旧方案（不推荐）**：
```typescript
export default function PickupPage() {
  useAuthGuard(true); // 每个页面都要写
  return <div>...</div>;
}
```

**新方案（推荐）**：
```typescript
// middleware.ts 统一处理
export function middleware(request: NextRequest) {
  // 全局拦截，无需每个页面重复
}

// 页面组件简洁
export default function PickupPage() {
  return <div>...</div>; // 不需要关心认证
}
```

### 6.2 为什么菜单配置要独立？

1. **路由是技术实现** - 由文件系统决定
2. **菜单是业务需求** - 需要灵活配置

```typescript
// 可能有很多路由，但菜单只显示部分
app/
├── (main)/
│   ├── page.tsx              # 显示在菜单
│   ├── pickup/page.tsx       # 显示在菜单
│   ├── pickup/[id]/page.tsx  # 不显示在菜单（详情页）
│   └── settings/page.tsx     # 条件显示（需要权限）
```

### 6.3 Token 存储策略

```typescript
// 双重存储策略
setAccessToken(token) {
  // 1. localStorage - 供 API 请求使用
  localStorage.setItem('access_token', token);
  
  // 2. cookie - 供 middleware 使用
  document.cookie = `access_token=${token}; path=/`;
}
```

**原因**：
- `middleware.ts` 运行在服务端，只能读取 cookie
- `api-client.ts` 运行在客户端，可以读取 localStorage

## 七、常见问题

### Q1: 为什么不直接用文件系统路由生成菜单？

A: 因为菜单需要：
- 自定义显示顺序
- 权限控制
- 图标和样式
- 隐藏某些路由（如详情页）

### Q2: middleware 和 useAuth 的区别？

A:
- **middleware**: 服务端拦截，控制能否访问页面
- **useAuth**: 客户端状态，提供用户信息和方法

### Q3: 如何添加新页面？

```bash
# 1. 创建路由文件
app/(main)/new-page/page.tsx

# 2. （可选）添加到菜单配置
config/menu.ts
```

## 八、最佳实践

1. ✅ 使用 middleware.ts 做全局认证
2. ✅ 使用路由组组织代码
3. ✅ 菜单配置与路由分离
4. ✅ 统一的错误处理
5. ✅ TypeScript 类型安全

---

**总结**：这是一个遵循 Next.js 最佳实践的现代化架构，通过中间件实现全局认证，通过配置化菜单实现灵活的权限控制。

