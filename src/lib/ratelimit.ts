import Redis from "ioredis";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";

// 1. Definir el espacio global para desarrollo
const globalForRedis = global as unknown as {
  redisClient: Redis;
  mutationLimiter: RateLimiterRedis;
  reviewLimiter: RateLimiterRedis;
  attemptLimiter: RateLimiterRedis;
};

// 2. Instanciar el cliente de ioredis (se conecta automáticamente)
export const redisClient =
  globalForRedis.redisClient ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// 3. Instanciar o reutilizar los limitadores
export const mutationLimiter =
  globalForRedis.mutationLimiter ||
  new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rl:mutation",
    points: 30,
    duration: 60,
  });

export const reviewLimiter =
  globalForRedis.reviewLimiter ||
  new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rl:review",
    points: 3,
    duration: 3600,
  });

export const attemptLimiter =
  globalForRedis.attemptLimiter ||
  new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rl:attempt",
    points: 5,
    duration: 3600,
  });

// 4. Guardar en global si estamos en desarrollo
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redisClient;
  globalForRedis.mutationLimiter = mutationLimiter;
  globalForRedis.reviewLimiter = reviewLimiter;
  globalForRedis.attemptLimiter = attemptLimiter;
}

// Helper tipado para consumir un punto
export async function checkLimit(
  limiter: RateLimiterRedis,
  key: string,
): Promise<boolean> {
  try {
    await limiter.consume(key);
    return true;
  } catch (e) {
    if (e instanceof RateLimiterRes) return false;
    throw e;
  }
}

export function buildRateLimitKey(
  userId: string,
  ip: string,
  prefix: string,
): string {
  return `${prefix}:${userId}:${ip}`;
}