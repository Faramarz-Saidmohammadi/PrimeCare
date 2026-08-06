type Entry = { count: number; resetAt: number };
const globalRateStore = globalThis as typeof globalThis & { primeCareRateStore?: Map<string, Entry> };
const store = globalRateStore.primeCareRateStore ?? new Map<string, Entry>();
globalRateStore.primeCareRateStore = store;

function cleanExpired(now: number) {
  if (store.size < 500) return;
  for (const [key, entry] of store) if (entry.resetAt <= now) store.delete(key);
}

export function rateLimit(key: string, limit = 6, windowMs = 60_000) {
  const now = Date.now();
  cleanExpired(now);
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) };
  }
  entry.count += 1;
  store.set(key, entry);
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}
