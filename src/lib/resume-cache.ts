// In-memory cache for resume data (profile, experience, education, skills).
// Public visitors hit these endpoints on every page view; caching avoids
// redundant DB round-trips for data that rarely changes.

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
