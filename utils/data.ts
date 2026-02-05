export function mergeByKey<T extends Record<string, any>, K extends keyof T>(
    a1: T[],
    a2: T[],
    key: K
  ) {
    const map = new Map<T[K], T>();
  
    for (const item of a1) map.set(item[key], item);
    for (const item of a2) map.set(item[key], item); // a2 覆盖 a1（用于更新）
  
    return Array.from(map.values());
  }