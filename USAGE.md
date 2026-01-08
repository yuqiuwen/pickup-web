# 使用指南

## 快速开始

### 1. 首次运行

```bash
# 克隆项目
git clone <repository-url>
cd pickup-web

# 安装依赖
pnpm install

# 创建本地环境变量文件
cp .env.local.example .env.local

# 编辑 .env.local，设置后端 API 地址
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 即可看到登录页面。

### 2. 注册账号

1. 点击"立即注册"
2. 填写用户名、邮箱和密码
3. 提交后自动登录并跳转到首页

### 3. 登录系统

1. 输入用户名和密码
2. 点击"登录"
3. 成功后跳转到首页

## 核心功能使用

### 认证管理

#### 登录流程

```
用户输入凭证 → 调用 /api/v1/auth/login 
→ 后端验证 
→ 返回 access_token（存储在 localStorage）
→ 设置 refresh_token（httpOnly cookie）
→ 获取用户信息
→ 跳转到首页
```

#### Token 刷新

系统会自动处理 token 刷新：
- 当 API 返回 40001（未授权）时
- 自动尝试使用 refresh_token 刷新
- 刷新失败则跳转到登录页

#### 登出流程

```
点击登出 
→ 调用 /api/v1/auth/logout 
→ 清除本地 token 
→ 清除用户状态 
→ 跳转到登录页
```

### 菜单权限

#### 配置菜单权限

在 `config/menu.ts` 中配置：

```typescript
{
  id: 'admin',
  label: '管理后台',
  path: '/admin',
  icon: Shield,
  roles: ['admin'], // 只有 admin 角色可见
}
```

#### 权限级别

1. **公开菜单**: `roles: []` 或不设置 `roles`
2. **需要认证**: 所有登录用户都可以访问
3. **角色限制**: 只有指定角色才能访问

### 路由保护

#### 使用路由守卫

在页面组件中使用 `useAuthGuard`：

```typescript
// 需要登录才能访问
export default function ProtectedPage() {
  useAuthGuard(true);
  // ...
}

// 不需要登录（如登录页）
export default function LoginPage() {
  useAuthGuard(false);
  // ...
}

// 需要特定角色
export default function AdminPage() {
  useAuthGuard(true, ['admin']);
  // ...
}
```

#### 路由守卫行为

- 未登录访问需认证页面 → 跳转到 `/auth/login`
- 已登录访问登录页 → 跳转到首页 `/`
- 权限不足 → 跳转到 `/403`

### API 请求

#### 基本用法

```typescript
import request from '@/lib/api-client';

// GET 请求
const response = await request.get('/api/v1/users');
const users = response.data;

// POST 请求
const response = await request.post('/api/v1/users', {
  username: 'test',
  email: 'test@example.com',
});

// PUT 请求
await request.put('/api/v1/users/1', {
  username: 'new-name',
});

// DELETE 请求
await request.delete('/api/v1/users/1');
```

#### 创建新的 API 接口

1. 在 `types/` 中定义类型：

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

2. 在 `lib/api/` 中定义 API：

```typescript
// lib/api/user.ts
import request from '@/lib/api-client';
import { User } from '@/types/user';

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await request.get<User[]>('/api/v1/users');
    return response.data || [];
  },
  
  getUser: async (id: string): Promise<User> => {
    const response = await request.get<User>(`/api/v1/users/${id}`);
    if (!response.data) throw new Error('用户不存在');
    return response.data;
  },
};
```

3. 在组件中使用：

```typescript
import { userApi } from '@/lib/api/user';

const users = await userApi.getUsers();
```

#### 错误处理

错误会自动被拦截器处理：

- **40001（未授权）**: 自动跳转到登录页
- **40003（无权限）**: 显示错误提示
- **其他错误**: 如果有 `errmsg` 会显示 toast 提示

如需自定义错误处理：

```typescript
try {
  await request.post('/api/v1/data', payload);
} catch (error) {
  // 自定义错误处理
  console.error('操作失败:', error);
}
```

### 全局提示

#### 使用 Toast

```typescript
import { toast } from '@/hooks/use-toast';

// 成功提示
toast({
  title: '操作成功',
  description: '数据已保存',
});

// 错误提示
toast({
  title: '操作失败',
  description: '请检查输入',
  variant: 'destructive',
});
```

Toast 会自动显示在屏幕右上角，3 秒后自动消失。

### 布局使用

#### 使用应用布局

```typescript
import { AppLayout } from '@/components/layout/app-layout';

export default function MyPage() {
  return (
    <AppLayout>
      <h1>页面标题</h1>
      <p>页面内容</p>
    </AppLayout>
  );
}
```

`AppLayout` 会自动包含：
- 侧边栏菜单
- 顶部用户信息栏
- 主内容区域

#### 自定义布局

如果需要完全自定义布局（如登录页），直接返回 JSX：

```typescript
export default function CustomPage() {
  return (
    <div className="custom-layout">
      {/* 自定义内容 */}
    </div>
  );
}
```

## 开发指南

### 添加新页面

1. 在 `app/(main)/` 下创建新目录：

```bash
mkdir -p app/(main)/my-feature
```

2. 创建 `page.tsx`：

```typescript
"use client";

import { useAuthGuard } from '@/hooks/use-auth-guard';
import { AppLayout } from '@/components/layout/app-layout';

export default function MyFeaturePage() {
  useAuthGuard(true); // 需要登录
  
  return (
    <AppLayout>
      <h1>My Feature</h1>
    </AppLayout>
  );
}
```

3. 在 `config/menu.ts` 中添加菜单项：

```typescript
{
  id: 'my-feature',
  label: 'My Feature',
  path: '/my-feature',
  icon: Star,
}
```

### 添加新组件

1. 在 `components/` 下创建组件文件：

```typescript
// components/my-component.tsx
"use client";

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

2. 使用组件：

```typescript
import { MyComponent } from '@/components/my-component';

<MyComponent title="Hello" />
```

### 状态管理

#### 使用 React Context

全局状态已通过 `AuthContext` 管理认证状态。如需添加新的全局状态：

1. 创建新的 Context：

```typescript
// contexts/app-context.tsx
"use client";

import { createContext, useContext, useState } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
```

2. 在根布局中添加 Provider：

```typescript
// app/layout.tsx
<AuthProvider>
  <AppProvider>
    {children}
  </AppProvider>
</AuthProvider>
```

#### 使用自定义 Hooks

创建可复用的业务逻辑：

```typescript
// hooks/use-users.ts
import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api/user';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userApi.getUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return { users, loading };
}
```

使用：

```typescript
const { users, loading } = useUsers();
```

### 样式开发

#### 使用 TailwindCSS

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Button
  </button>
</div>
```

#### 响应式设计

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 移动端 1 列，平板 2 列，桌面 3 列 */}
</div>
```

#### 合并类名

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // 允许外部覆盖
)}>
```

## 最佳实践

### 1. 类型安全

始终为函数参数和返回值添加类型：

```typescript
// ✅ 好
function getUser(id: string): Promise<User> {
  // ...
}

// ❌ 不好
function getUser(id) {
  // ...
}
```

### 2. 错误处理

为异步操作添加错误处理：

```typescript
// ✅ 好
try {
  await request.post('/api/v1/data', data);
  toast({ title: '保存成功' });
} catch (error) {
  // 错误已被拦截器处理，这里可以添加额外逻辑
}

// ❌ 不好
await request.post('/api/v1/data', data); // 没有错误处理
```

### 3. 加载状态

为异步操作添加加载状态：

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await saveData();
  } finally {
    setLoading(false);
  }
};

<Button disabled={loading}>
  {loading ? '保存中...' : '保存'}
</Button>
```

### 4. 组件拆分

保持组件职责单一，及时拆分大组件：

```typescript
// ✅ 好 - 拆分成小组件
<UserCard user={user} />
<UserActions user={user} />

// ❌ 不好 - 一个组件做太多事情
<UserPanel /> // 包含了卡片、操作、表单等
```

### 5. 代码组织

按功能模块组织代码：

```
app/(main)/users/
  ├── page.tsx           # 列表页
  ├── [id]/
  │   └── page.tsx       # 详情页
  └── components/        # 用户模块专用组件
      ├── user-card.tsx
      └── user-form.tsx
```

## 故障排查

### 常见问题

#### 1. 登录后立即跳回登录页

**原因**: Token 未正确存储或后端返回格式不正确

**解决**:
- 检查浏览器控制台是否有错误
- 检查 localStorage 中是否有 `access_token`
- 检查后端返回的数据格式是否符合要求

#### 2. API 请求失败

**原因**: 后端服务未启动或 URL 配置错误

**解决**:
- 检查 `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL`
- 确认后端服务正在运行
- 检查浏览器网络面板

#### 3. 菜单不显示

**原因**: 用户角色不匹配或未登录

**解决**:
- 检查用户的 `roles` 字段
- 检查菜单配置中的 `roles` 要求
- 确认已成功登录

#### 4. 样式不生效

**原因**: TailwindCSS 类名未被扫描

**解决**:
- 重启开发服务器
- 检查文件是否在 `app/` 或 `components/` 目录下
- 清除 `.next` 缓存：`rm -rf .next`

## 更多资源

- [Next.js 文档](https://nextjs.org/docs)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Radix UI 文档](https://www.radix-ui.com)

