/**
 * Rate limit em memória (best-effort por instância).
 * Para produção multi-instância, considerar Upstash Ratelimit.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_ENTRIES = 5000;

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > MAX_ENTRIES) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }
  if (entry.count >= limit) {
    return { ok: false as const, retryAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { ok: true as const };
}
