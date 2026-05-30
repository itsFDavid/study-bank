import { Ratelimit } from "@upstash/ratelimit";
import { createClient, RedisClientType } from "redis";

// 1. Inicializar el cliente nativo de Redis apuntando a tu Docker
// En producción, hereda del .env; localmente apunta a tu localhost
const nativeRedisClient = createClient({
  url: process.env.LOCAL_REDIS_URL || "redis://localhost:6379",
}) as unknown as RedisClientType;

// Conectar el cliente (exigido por la v4 de la librería 'redis')
nativeRedisClient.connect().catch((err) => {
  console.error("Redis Connection Error:", err);
});

// 2. Instanciar los limitadores inyectando el cliente nativo mediante el adaptador
export const ratelimit = new Ratelimit({
  redis: nativeRedisClient as any, // 👈 Pasamos el cliente TCP local directo
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min por IP
  analytics: false, // ⚠️ Desactiva analytics, Upstash Analytics requiere su API en la nube
});

export const reviewRatelimit = new Ratelimit({
  redis: nativeRedisClient,
  limiter: Ratelimit.fixedWindow(3, "1 h"), // 3 reseñas por hora
});

export const mutationRatelimit = new Ratelimit({
  redis: nativeRedisClient,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 mutaciones/min
});