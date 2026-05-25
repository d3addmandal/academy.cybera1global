interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

// Prune expired entries every 5 minutes to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, w] of windows) {
    if (now >= w.resetAt) windows.delete(key);
  }
}, 5 * 60_000).unref?.();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let w = windows.get(key);

  if (!w || now >= w.resetAt) {
    w = { count: 1, resetAt: now + windowMs };
    windows.set(key, w);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (w.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
  }

  w.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Track failed login attempts separately (5 attempts / 15 min before lockout)
const LOCKOUT_LIMIT = 5;
const LOCKOUT_WINDOW_MS = 15 * 60_000;

const failedAttempts = new Map<string, Window>();

setInterval(() => {
  const now = Date.now();
  for (const [key, w] of failedAttempts) {
    if (now >= w.resetAt) failedAttempts.delete(key);
  }
}, 5 * 60_000).unref?.();

export function recordFailedLogin(
  key: string,
  increment: boolean
): { locked: boolean; remaining: number } {
  const now = Date.now();
  let w = failedAttempts.get(key);

  if (!w || now >= w.resetAt) {
    if (increment) {
      w = { count: 1, resetAt: now + LOCKOUT_WINDOW_MS };
      failedAttempts.set(key, w);
    }
    return { locked: false, remaining: LOCKOUT_LIMIT - 1 };
  }

  if (w.count >= LOCKOUT_LIMIT) {
    return { locked: true, remaining: 0 };
  }

  if (increment) w.count++;

  return {
    locked: w.count >= LOCKOUT_LIMIT,
    remaining: Math.max(0, LOCKOUT_LIMIT - w.count),
  };
}

export function resetFailedLogin(key: string): void {
  failedAttempts.delete(key);
}
