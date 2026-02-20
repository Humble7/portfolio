import { prisma } from "@/lib/prisma";

// In-memory cache for hot-path settings (e.g. called on every page view)
const cache = new Map<string, { value: string; expires: number }>();
const CACHE_TTL = 30_000; // 30 seconds

/**
 * Read a boolean site setting from DB.
 * @param key - The setting key
 * @param defaultValue - Default if not set (default: true)
 * @param cached - Use in-memory cache for hot paths (default: false)
 */
export async function getSetting(
  key: string,
  defaultValue = true,
  cached = false
): Promise<boolean> {
  if (cached) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
      return hit.value !== "false";
    }
  }

  const row = await prisma.siteSetting.findUnique({ where: { key } });
  const raw = row?.value ?? String(defaultValue);

  if (cached) {
    cache.set(key, { value: raw, expires: Date.now() + CACHE_TTL });
  }

  return raw !== "false";
}
