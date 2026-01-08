# 部署指南

## 环境配置

### 1. 创建环境变量文件

根据不同环境创建对应的环境变量文件：

#### 开发环境 (.env.development)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

#### 生产环境 (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_ENV=production
```

#### 本地环境 (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=local
```

### 2. 后端 API 要求

项目需要配合 FastAPI 后端使用，后端需要提供以下接口：

#### 认证接口

**登录**
```
POST /api/v1/auth/login
Content-Type: application/json

请求体:
{
  "username": "string",
  "password": "string"
}

响应:
{
  "code": 0,
  "msg": "successful",
  "errmsg": null,
  "data": {
    "access_token": "eyJ...",
    "token_type": "Bearer",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "roles": ["user", "admin"],
      "avatar": "https://..."
    }
  }
}

注意: refresh_token 通过 response.set_cookie 设置
```

**注册**
```
POST /api/v1/auth/register
Content-Type: application/json

请求体:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

响应格式同登录
```

**登出**
```
POST /api/v1/auth/logout
Authorization: Bearer {access_token}

响应:
{
  "code": 0,
  "msg": "successful",
  "errmsg": null
}
```

**刷新 Token**
```
POST /api/v1/auth/refresh
Cookie: refresh_token=xxx

响应:
{
  "code": 0,
  "msg": "successful",
  "errmsg": null,
  "data": {
    "access_token": "eyJ..."
  }
}
```

**获取当前用户**
```
GET /api/v1/auth/me
Authorization: Bearer {access_token}

响应:
{
  "code": 0,
  "msg": "successful",
  "errmsg": null,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "roles": ["user"],
    "avatar": "https://..."
  }
}
```

## 构建和部署

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 生产环境

#### 方式一：使用 Node.js

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start

# 使用 PM2 管理进程
pm2 start npm --name "pickup-web" -- start
pm2 save
pm2 startup
```

#### 方式二：使用 Docker

创建 `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
      - NEXT_PUBLIC_APP_ENV=production
    restart: unless-stopped
```

运行：

```bash
docker-compose up -d
```

#### 方式三：部署到 Vercel

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

在 Vercel 控制台配置环境变量。

## Nginx 反向代理配置

如果使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## HTTPS 配置

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 性能优化

### 1. 启用 Next.js 压缩

在 `next.config.ts` 中：

```typescript
const nextConfig = {
  compress: true,
  // ...
}
```

### 2. 配置 CDN

将静态资源部署到 CDN：

```typescript
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
}
```

### 3. 启用图片优化

```typescript
const nextConfig = {
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

## 监控和日志

### 1. 添加错误监控

推荐使用 Sentry：

```bash
pnpm add @sentry/nextjs
```

### 2. 添加性能监控

在 `instrumentation.ts` 中配置 OpenTelemetry。

### 3. 日志收集

使用 PM2 日志：

```bash
pm2 logs pickup-web
pm2 logs pickup-web --lines 100
```

## 备份策略

1. 定期备份环境变量文件
2. 备份数据库（如果有）
3. 使用 Git 管理代码版本

## 回滚策略

使用 PM2 保存上一个版本：

```bash
# 保存当前版本
pm2 save

# 如果出现问题，回滚
git checkout previous-tag
pnpm install
pnpm build
pm2 restart pickup-web
```

## 故障排查

### 常见问题

1. **API 请求失败**
   - 检查 `NEXT_PUBLIC_API_BASE_URL` 配置
   - 检查后端服务是否正常
   - 检查 CORS 配置

2. **认证失败**
   - 检查 token 是否正确存储
   - 检查 cookie 配置（httpOnly, secure, sameSite）
   - 检查后端认证接口

3. **页面加载慢**
   - 启用 Next.js 静态生成
   - 使用 CDN 加速静态资源
   - 优化图片大小

4. **构建失败**
   - 清除缓存：`rm -rf .next`
   - 重新安装依赖：`rm -rf node_modules && pnpm install`
   - 检查 TypeScript 错误

## 维护检查清单

- [ ] 定期更新依赖包
- [ ] 检查安全漏洞：`pnpm audit`
- [ ] 监控服务器资源使用
- [ ] 检查日志文件大小
- [ ] 测试备份恢复流程
- [ ] 更新 SSL 证书

## 支持

如有问题，请查看项目文档或提交 Issue。

