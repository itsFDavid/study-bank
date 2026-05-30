import { createClient } from "redis";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.connect().catch((err) => {
  console.error("[Redis] Connection error:", err);
});

redisClient.on("error", (err) => {
  console.error("[Redis] Client error:", err);
});

// 30 mutaciones por minuto (añadir/editar/borrar preguntas y bancos)
export const mutationLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:mutation",
  points: 30,
  duration: 60,
});

// 3 reseñas por hora
export const reviewLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:review",
  points: 3,
  duration: 3600,
});

// 5 intentos de quiz registrados por hora
export const attemptLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:attempt",
  points: 5,
  duration: 3600,
});

// Helper tipado para consumir un punto — retorna false si excede el límite
export async function checkLimit(
  limiter: RateLimiterRedis,
  key: string,
): Promise<boolean> {
  try {
    await limiter.consume(key);
    return true;
  } catch (e) {
    if (e instanceof RateLimiterRes) return false; // límite alcanzado
    throw e; // error real de Redis — propagar
  }
}

export function buildRateLimitKey(userId: string, ip: string, prefix: string): string {
  return `${prefix}:${userId}:${ip}`;
}