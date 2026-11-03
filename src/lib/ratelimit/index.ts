import { NextResponse } from "next/server";
import { redis } from "../redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

// Fallback in-memory store for environments where Redis is temporarily offline
const inMemoryStore = new Map<string, number[]>();

/**
 * Checks a sliding window rate limit using Redis with an in-memory fallback.
 * 
 * @param key Identificador único del limitador (ej: 'rl:login:127.0.0.1' o 'rl:tenant:uuid')
 * @param limit Número máximo de peticiones permitidas en la ventana
 * @param windowSeconds Tamaño de la ventana en segundos
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  try {
    if (redis.status === "wait") {
      await redis.connect();
    }

    const member = `${now}-${Math.random().toString(36).slice(2, 9)}`;

    // Pipeline atómico para sliding window en Redis
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zrange(key, 0, 0, "WITHSCORES");

    const results = await pipeline.exec();

    if (!results || results.some(([err]) => err)) {
      throw new Error("Redis pipeline execution returned errors");
    }

    const currentCount = (results[1][1] as number) || 0;
    const oldestEntries = (results[2][1] as string[]) || [];

    if (currentCount >= limit) {
      let retryAfter = windowSeconds;
      if (oldestEntries.length >= 2) {
        const oldestTimestamp = parseInt(oldestEntries[1], 10);
        if (!isNaN(oldestTimestamp)) {
          retryAfter = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
        }
      }

      return {
        success: false,
        limit,
        remaining: 0,
        retryAfterSeconds: retryAfter,
      };
    }

    // Agregar la petición y fijar expiración de la clave
    const addPipeline = redis.pipeline();
    addPipeline.zadd(key, now, member);
    addPipeline.pexpire(key, windowMs);
    await addPipeline.exec();

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - (currentCount + 1)),
      retryAfterSeconds: 0,
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[RateLimit] Falling back to in-memory sliding window:", (err as Error).message);
    }

    // In-memory fallback
    const timestamps = inMemoryStore.get(key) || [];
    const validTimestamps = timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= limit) {
      const oldest = validTimestamps[0] || windowStart;
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      inMemoryStore.set(key, validTimestamps);
      return {
        success: false,
        limit,
        remaining: 0,
        retryAfterSeconds: retryAfter,
      };
    }

    validTimestamps.push(now);
    inMemoryStore.set(key, validTimestamps);

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - validTimestamps.length),
      retryAfterSeconds: 0,
    };
  }
}

/**
 * Genera la respuesta HTTP 429 estandarizada exigida por la directiva ratelimit-engine.
 * Cabecera Retry-After obligatoria y JSON estándar.
 */
export function rateLimitResponse(
  retryAfterSeconds: number,
  errorMessage: string = "Límite de peticiones excedido para este santuario"
): NextResponse {
  return NextResponse.json(
    {
      error: errorMessage,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}

/**
 * Rate limit específico para inicio de sesión: Máximo 5 intentos por IP cada 15 minutos (900s).
 */
export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  const safeIp = ip.replace(/[^a-zA-Z0-9:._-]/g, "") || "unknown";
  return checkRateLimit(`rl:login:${safeIp}`, 5, 900);
}

/**
 * Rate limit específico para operaciones de dominio POST: Máximo 30 peticiones por minuto por Tenant.
 */
export async function checkTenantDomainRateLimit(tenantId: string): Promise<RateLimitResult> {
  const safeTenant = tenantId.replace(/[^a-zA-Z0-9_-]/g, "") || "unknown";
  return checkRateLimit(`rl:domain:${safeTenant}`, 30, 60);
}

/**
 * Rate limit para endpoints de red o colaboración: Máximo 10 peticiones por minuto por Tenant.
 */
export async function checkNetworkRateLimit(tenantId: string): Promise<RateLimitResult> {
  const safeTenant = tenantId.replace(/[^a-zA-Z0-9_-]/g, "") || "unknown";
  return checkRateLimit(`rl:network:${safeTenant}`, 10, 60);
}
