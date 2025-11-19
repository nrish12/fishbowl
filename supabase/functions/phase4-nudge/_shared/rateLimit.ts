interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, RateLimitStore>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (now > value.resetAt) {
      inMemoryStore.delete(key);
    }
  }
}

async function checkRateLimitWithRedis(
  identifier: string,
  config: RateLimitConfig,
  redisUrl: string,
  redisToken: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['ZADD', key, now, `${now}-${Math.random()}`],
        ['ZREMRANGEBYSCORE', key, 0, windowStart],
        ['ZCARD', key],
        ['EXPIRE', key, Math.ceil(config.windowMs / 1000)],
      ]),
    });

    if (!response.ok) {
      throw new Error('Redis request failed');
    }

    const results = await response.json();
    const count = results[2]?.result || 0;
    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);
    const resetAt = now + config.windowMs;

    return { allowed, remaining, resetAt };
  } catch (error) {
    console.warn('Redis rate limit check failed, falling back to in-memory:', error);
    return checkRateLimitInMemory(identifier, config);
  }
}

function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupExpired();

  const now = Date.now();
  const store = inMemoryStore.get(identifier);

  if (!store || now > store.resetAt) {
    const resetAt = now + config.windowMs;
    inMemoryStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  store.count++;
  const allowed = store.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - store.count);

  return { allowed, remaining, resetAt: store.resetAt };
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

  if (redisUrl && redisToken) {
    return checkRateLimitWithRedis(identifier, config, redisUrl, redisToken);
  }

  return checkRateLimitInMemory(identifier, config);
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`;
}