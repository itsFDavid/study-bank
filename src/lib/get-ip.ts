import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const h = await headers();

  // Cloudflare — el más confiable si estás detrás de CF
  const cfIp = h.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Otros proxies de confianza (Vercel, Railway, etc.)
  const xRealIp = h.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  // x-forwarded-for — tomar solo la primera IP (cliente original)
  // NOTA: puede ser falsificada si no hay proxy de confianza delante
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "anonymous";
}