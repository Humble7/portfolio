// In-memory deduplication: same IP+path won't be counted twice per day.
// Cleared automatically on day rollover.

let currentDay = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
const seen = new Set<string>();

/**
 * Returns true if this IP+path combo has already been recorded today.
 * Side effect: marks it as seen if not already.
 */
export function isDuplicate(ip: string, path: string): boolean {
  const today = new Date().toISOString().slice(0, 10);

  // Day rolled over — clear the set
  if (today !== currentDay) {
    seen.clear();
    currentDay = today;
  }

  const key = `${ip}:${path}`;
  if (seen.has(key)) return true;

  seen.add(key);
  return false;
}
