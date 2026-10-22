interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10); // 60 requests / minute

/**
 * Basic in-memory rate limiter for API route handlers and WebSocket connections
 */
export function checkRateLimit(identifier: string): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { success: true, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: MAX_REQUESTS - record.count, reset: record.resetTime };
}
