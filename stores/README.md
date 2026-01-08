# RSA Public Key 缓存机制

## 概述

使用 Zustand 实现的 RSA 公钥缓存机制，避免每个页面重复获取公钥。

## 特性

- ✅ 自动缓存管理：首次获取后缓存 1 小时
- ✅ 缓存键格式：`${biz}:public_key`（例如：`user_pwd:public_key`）
- ✅ 自动过期检测：过期后自动重新获取
- ✅ 全局状态管理：使用 Zustand 跨组件共享
- ✅ 开箱即用：无需手动管理缓存逻辑

## 使用方法

### 基础使用

```typescript
import { useRSAKeyStore } from '@/stores/rsa-key-store';
import { rsaEncrypt } from '@/utils/rsa';

function MyComponent() {
  const { getPublicKey } = useRSAKeyStore();
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    (async () => {
      // 自动从缓存获取，缓存不存在或过期时才会请求 API
      const key = await getPublicKey('user_pwd');
      setPublicKey(key);
    })();
  }, [getPublicKey]);

  const handleEncrypt = async (password: string) => {
    if (!publicKey) return;
    const encrypted = await rsaEncrypt(password, publicKey);
    // 使用加密后的密码...
  };

  return <div>...</div>;
}
```

### 清除缓存

```typescript
import { useRSAKeyStore } from '@/stores/rsa-key-store';

function Settings() {
  const { clearCache, clearExpiredCache } = useRSAKeyStore();

  return (
    <>
      <button onClick={clearCache}>清空所有缓存</button>
      <button onClick={clearExpiredCache}>清理过期缓存</button>
    </>
  );
}
```

## API

### `getPublicKey(biz: 'user_pwd'): Promise<CryptoKey | null>`

获取 RSA 公钥，自动管理缓存。

- **参数**：`biz` - 业务类型（目前仅支持 `'user_pwd'`）
- **返回**：`Promise<CryptoKey | null>` - 返回公钥或 null（获取失败时）

### `clearCache(): void`

清空所有缓存的公钥。

### `clearExpiredCache(): void`

清理已过期的缓存，保留有效缓存。

## 缓存配置

### 默认配置

- **缓存时长**：1 小时（3600000 毫秒）
- **缓存键格式**：`${biz}:public_key`

### 自定义缓存时长

修改 `/stores/rsa-key-store.ts` 中的 `DEFAULT_CACHE_DURATION` 常量：

```typescript
// 修改为 30 分钟
const DEFAULT_CACHE_DURATION = 30 * 60 * 1000;

// 修改为 2 小时
const DEFAULT_CACHE_DURATION = 2 * 60 * 60 * 1000;
```

## 工作原理

1. **首次调用**：`getPublicKey('user_pwd')` → 请求 API → 缓存结果 → 返回公钥
2. **后续调用（缓存有效）**：`getPublicKey('user_pwd')` → 直接从缓存返回 → 无网络请求
3. **缓存过期**：`getPublicKey('user_pwd')` → 检测过期 → 重新请求 API → 更新缓存 → 返回公钥

## 已集成的组件

以下组件已使用 RSA 公钥缓存机制：

- `components/auth/register-drawer.tsx` - 注册抽屉
- `components/auth/login-drawer.tsx` - 登录抽屉
- `app/auth/register/page.tsx` - 注册页面
- `app/auth/login/page.tsx` - 登录页面

## 日志

缓存机制会在控制台输出日志，方便调试：

- `[RSA Cache] 使用缓存的公钥: user_pwd:public_key` - 使用缓存
- `[RSA Cache] 获取新的公钥: user_pwd:public_key` - 请求新公钥
- `[RSA Cache] 清空所有缓存` - 手动清空缓存
- `[RSA Cache] 清理过期缓存` - 清理过期项

## 注意事项

1. **CryptoKey 无法序列化**：由于 `CryptoKey` 对象无法序列化到 localStorage，缓存仅在内存中保存。页面刷新后缓存会丢失，但会自动重新获取。

2. **跨标签页**：不同浏览器标签页的缓存是独立的，无法共享。

3. **过期策略**：缓存采用惰性过期策略，只在调用 `getPublicKey` 时检测过期，不会主动清理。如需主动清理，调用 `clearExpiredCache()`。

## 性能优化

- ✅ 减少网络请求：每小时仅需请求一次 API
- ✅ 提升用户体验：无需等待公钥获取，即时可用
- ✅ 降低服务器负载：减少重复的公钥请求

