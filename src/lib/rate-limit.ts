// Simple in-memory rate limiter (per IP, sliding window)
// Sufficient for a personal portfolio site; for production at scale, use Redis.

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 3600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 600_000);

/**
 * Check if a request is rate-limited.
 * @param ip - Client IP address
 * @param limit - Max requests allowed in the window (default: 5)
 * @param windowMs - Time window in ms (default: 1 hour)
 * @returns { allowed: boolean, remaining: number }
 */
export function rateLimit(
  ip: string,
  limit = 5,
  windowMs = 3600_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(ip, entry);

  return { allowed: true, remaining: limit - entry.timestamps.length };
}
