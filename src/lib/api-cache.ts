// In-memory TTL cache for public API responses.
// Avoids redundant DB round-trips for data that rarely changes.
// Write operations (POST/PUT/DELETE) should call clearCache() to invalidate.

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const TTL = 60_000; // 60 seconds

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  store.delete(key);
  return null;
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, expires: Date.now() + TTL });
}

export function clearCache(key: string): void {
  store.delete(key);
}

/** Clear all keys that start with a given prefix (e.g. "blog:" clears "blog:list", "blog:abc123") */
export function clearCachePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
