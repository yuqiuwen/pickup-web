# Pickup Web


## 技术栈

- **框架**: Next.js 16.1.1 (App Router)
- **语言**: TypeScript 5.x
- **样式**: TailwindCSS 4.x
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: Zustand (用于认证状态)
- **HTTP 客户端**: Axios
- **图标**: Lucide React

## 项目结构

```
pickup-web/
├── app/                          # Next.js App Router 目录
│   ├── (main)/                   # 主要页面路由组（需要认证）
│   │   └── layout.tsx            # 主要布局
│   ├── auth/                     # 认证相关页面（不需要认证）
│   │   ├── login/                # 登录页
│   │   ├── register/             # 注册页
│   │   └── layout.tsx            # 认证布局
│   ├── 403/                      # 403 无权限页面
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
├── components/                   # 组件目录
│   ├── ui                        # shadcn/ui 基础组件
│   └── layout                    # 布局组件
├── contexts/                     # React Context
│   └── auth-context.tsx          # 认证上下文
├── hooks                         # 自定义 Hook
├── lib/                          # 工具库
│   ├── api-client.ts             # API 请求客户端（带拦截器）
│   ├── api/                      # API 接口定义
│   │   └── auth.ts               # 认证相关 API
│   └── utils.ts                  # 工具函数
├── types/                        # TypeScript 类型定义
│   ├── auth.ts                   # 认证相关类型
│   ├── api.ts                    # API 响应类型
│   ├── menu.ts                   # 菜单配置类型
│   └── index.ts                  # 类型导出
├── config/                       # 配置文件
│   └── menu.ts                   # 菜单配置
├── proxy.ts                      # Next.js 代理配置
├── .env.development              # 开发环境变量（需手动创建）
├── .env.production               # 生产环境变量（需手动创建）
├── .env.local.example            # 本地环境变量示例
├── next.config.ts                # Next.js 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖配置
```


## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=local
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 构建生产版本

```bash
pnpm build
pnpm start
```

## API 接口规范

### 请求头
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### 响应格式
```json
{
  "code": 0,              // 0 表示成功
  "msg": "successful",    // 消息
  "errmsg": null,        // 错误消息（有值时会全局提示）
  "data": {}             // 响应数据
}
```

### 错误码
- `0`: 成功
- `40001`: 未授权（会跳转到登录页）
- `40003`: 无权限（会显示 403 页面）
- 其他: 请求失败（会显示错误提示）



## 菜单配置

在 `config/menu.ts` 中配置菜单：

```typescript
export const menuConfig: MenuConfig = [
  {
    id: 'home',
    title: 'Home',
    path: '/',
    icon: Home,
    roles: [], // 空数组表示所有人都可访问
    children: []
  },
  {
    id: 'admin',
    label: '管理面板',
    path: '/admin',
    icon: Shield,
    roles: ['admin'], // 只有 admin 角色可以访问
  },
];
```



## 开发规范

### 1. 组件开发
- 使用 TypeScript 严格模式
- 使用函数式组件 + Hooks
- 使用 `"use client"` 标记客户端组件

### 2. 样式开发
- 使用 TailwindCSS 工具类
- 使用 `cn()` 函数合并类名
- 遵循响应式设计原则

### 3. 状态管理
- 使用 React Context 管理全局状态
- 使用自定义 Hooks 封装业务逻辑
- 避免 prop drilling

### 4. API 调用
- 统一使用 `request` 发起请求
- 在 `lib/api/` 目录下定义 API 接口
- 错误处理由拦截器统一处理

## 扩展指南

### 添加新页面
1. 在 `app/(main)/` 下创建新路由目录
2. 使用 `useAuthGuard` 保护路由
3. 使用 `AppLayout` 包裹页面内容

### 添加新菜单
1. 在 `config/menu.ts` 中添加菜单配置
2. 配置 `roles` 字段控制权限
3. 菜单会自动根据用户角色显示

### 添加新 API
1. 在 `types/` 中定义类型
2. 在 `lib/api/` 中定义 API 接口
3. 使用 `request` 发起请求

## 注意事项

1. **环境变量**: 以 `NEXT_PUBLIC_` 开头的变量会暴露到客户端
2. **Token 存储**: access_token 存储在 localStorage，refresh_token 存储在 httpOnly cookie
3. **路由组**: 使用 `(main)` 和 `(auth)` 路由组区分需要/不需要认证的页面
4. **代理配置**: 在 `proxy.ts` 中配置 API 代理，避免跨域问题

## 许可证

MIT
