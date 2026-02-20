// IP → country code resolver
// Priority: Vercel/CF headers (free) → in-memory cache → ip-api.com fallback

const cache = new Map<string, { country: string; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Resolve an IP address to a 2-letter country code.
 * Returns "XX" if resolution fails.
 */
export async function getCountryFromIP(
  ip: string,
  headerCountry?: string | null
): Promise<string> {
  // 1. Use hosting-provided header (Vercel, Cloudflare — free)
  if (headerCountry && headerCountry.length === 2) {
    return headerCountry.toUpperCase();
  }

  // Skip lookup for local/unknown IPs
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return "XX";
  }

  // 2. Check in-memory cache
  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.country;
  }

  // 3. Fallback: ip-api.com (free, 45 req/min, no key needed)
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      const country = data.countryCode || "XX";
      cache.set(ip, { country, expires: Date.now() + CACHE_TTL });
      return country;
    }
  } catch {
    // Network error or timeout — fall through
  }

  return "XX";
}
