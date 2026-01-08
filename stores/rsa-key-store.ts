/**
 * RSA 公钥缓存 Store
 * 
 * 使用示例：
 * 
 * ```tsx
 * import { useRSAKeyStore } from '@/stores/rsa-key-store';
 * 
 * function LoginForm() {
 *   const { getPublicKey } = useRSAKeyStore();
 *   const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
 * 
 *   useEffect(() => {
 *     (async () => {
 *       const key = await getPublicKey('user_pwd');
 *       setPublicKey(key);
 *     })();
 *   }, [getPublicKey]);
 * 
 *   // 使用 publicKey 进行加密...
 * }
 * ```
 * 
 * 缓存策略：
 * - 缓存时长：1 小时
 * - 缓存键：${biz}:public_key
 * - 自动过期：过期后重新获取
 */

import { create } from 'zustand';
import { getRSAPublicKeyApi } from '@/lib/api/secrets';
import { importPublicKeyFromPem } from '@/utils/rsa';

interface RSAKeyCache {
  key: CryptoKey;
  expiresAt: number;
}

interface RSAKeyStore {
  cache: Record<string, RSAKeyCache>;
  getPublicKey: (biz: 'user_pwd') => Promise<CryptoKey | null>;
  clearCache: () => void;
  clearExpiredCache: () => void;
}

// 默认缓存有效期：1小时（单位：毫秒）
const DEFAULT_CACHE_DURATION = 60 * 60 * 1000;

export const useRSAKeyStore = create<RSAKeyStore>((set, get) => ({
  cache: {},

  getPublicKey: async (biz: 'user_pwd') => {
    const cacheKey = `${biz}:public_key`;
    const now = Date.now();
    const cached = get().cache[cacheKey];

    // 如果缓存存在且未过期，直接返回
    if (cached && cached.expiresAt > now) {
      return cached.key;
    }

    // 缓存不存在或已过期，重新获取
    
    try {
      const res = await getRSAPublicKeyApi(biz);
      if (res?.data?.public_key) {
        const key = await importPublicKeyFromPem(res.data.public_key);
        
        // 存入缓存
        set((state) => ({
          cache: {
            ...state.cache,
            [cacheKey]: {
              key,
              expiresAt: now + DEFAULT_CACHE_DURATION,
            },
          },
        }));

        return key;
      }
      return null;
    } catch (error) {
      console.error(`[RSA Cache] 获取公钥失败: ${cacheKey}`, error);
      return null;
    }
  },

  clearCache: () => {

    set({ cache: {} });
  },

  clearExpiredCache: () => {
    const now = Date.now();
    set((state) => {
      const newCache: Record<string, RSAKeyCache> = {};
      Object.entries(state.cache).forEach(([key, value]) => {
        if (value.expiresAt > now) {
          newCache[key] = value;
        }
      });

      return { cache: newCache };
    });
  },
}));
