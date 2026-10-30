type Window = { startedAt: number; count: number };

// In-memory, so limits are per process. Enough for one web instance; a second
// instance would need shared storage.
export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
}) {
  const windows = new Map<string, Window>();

  return function isAllowed(key: string, now = Date.now()) {
    const current = windows.get(key);
    if (!current || now - current.startedAt >= options.windowMs) {
      windows.set(key, { startedAt: now, count: 1 });
      return true;
    }
    if (current.count >= options.limit) return false;
    windows.set(key, { ...current, count: current.count + 1 });
    return true;
  };
}
