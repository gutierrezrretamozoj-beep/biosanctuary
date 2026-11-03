import { NextResponse } from "next/server";
import { QueryRunner } from "typeorm";
import { redis } from "../redis";

export interface StoredIdempotencyResult {
  response_code: number;
  response_body: Record<string, unknown> | unknown[];
}

/**
 * Valida la presencia de la cabecera Idempotency-Key.
 * Si está ausente, retorna la respuesta de error HTTP 400 Bad Request correspondiente.
 */
export function validateIdempotencyHeader(
  idempotencyKey: string | null
): { valid: true; key: string } | { valid: false; response: NextResponse } {
  if (!idempotencyKey || !idempotencyKey.trim()) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Cabecera Idempotency-Key es obligatoria para esta operación" },
        { status: 400 }
      ),
    };
  }

  const trimmedKey = idempotencyKey.trim();
  // Validación de longitud para evitar ataques de inyección de buffer
  if (trimmedKey.length > 255) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Cabecera Idempotency-Key excede la longitud máxima permitida (255 caracteres)" },
        { status: 400 }
      ),
    };
  }

  return { valid: true, key: trimmedKey };
}

/**
 * Consulta si la clave de idempotencia ya fue procesada anteriormente en Redis o en la tabla idempotency_keys
 * del schema activo del tenant.
 */
export async function getStoredIdempotency(
  queryRunner: QueryRunner,
  tenantId: string,
  key: string
): Promise<StoredIdempotencyResult | null> {
  const cacheKey = `idemp:${tenantId}:${key}`;

  // 1. Intentar recuperación en Redis para respuesta de baja latencia
  try {
    if (redis.status === "wait") {
      await redis.connect();
    }
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as StoredIdempotencyResult;
      return parsed;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Idempotency] Redis lookup failed, querying database directly:", (err as Error).message);
    }
  }

  // 2. Si no está en Redis o Redis no está disponible, consultar tabla idempotency_keys del schema
  try {
    const rows = await queryRunner.query(
      `
      SELECT response_code, response_body, expires_at
      FROM idempotency_keys
      WHERE key = $1 AND expires_at > NOW()
      LIMIT 1;
      `,
      [key]
    );

    if (rows && rows.length > 0) {
      const result: StoredIdempotencyResult = {
        response_code: rows[0].response_code,
        response_body: rows[0].response_body,
      };

      // Re-popular en Redis con TTL de 24h
      try {
        await redis.set(cacheKey, JSON.stringify(result), "EX", 86400);
      } catch {
        // Silencioso si Redis está caído
      }

      return result;
    }
  } catch (err) {
    console.error("[Idempotency] Error querying idempotency_keys table:", err);
  }

  return null;
}

/**
 * Persiste la respuesta de la operación en la tabla idempotency_keys del tenant y en Redis con TTL de 24 horas.
 */
export async function saveIdempotentResponse(
  queryRunner: QueryRunner,
  tenantId: string,
  key: string,
  requestPath: string,
  responseCode: number,
  responseBody: unknown
): Promise<void> {
  const cacheKey = `idemp:${tenantId}:${key}`;
  const serializedBody = typeof responseBody === "object" ? responseBody : { value: responseBody };

  // 1. Guardar en PostgreSQL en el schema del tenant activo
  try {
    await queryRunner.query(
      `
      INSERT INTO idempotency_keys (key, request_path, response_code, response_body, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + interval '24 hours')
      ON CONFLICT (key) DO UPDATE
      SET response_code = EXCLUDED.response_code,
          response_body = EXCLUDED.response_body,
          expires_at = EXCLUDED.expires_at;
      `,
      [key, requestPath, responseCode, JSON.stringify(serializedBody)]
    );
  } catch (err) {
    console.error("[Idempotency] Error persisting idempotency key to database:", err);
  }

  // 2. Guardar en Redis con TTL de 24 horas (86400 segundos)
  try {
    const payload: StoredIdempotencyResult = {
      response_code: responseCode,
      response_body: serializedBody as Record<string, unknown>,
    };
    await redis.set(cacheKey, JSON.stringify(payload), "EX", 86400);
  } catch (err) {
    // Si Redis está fuera de línea, la clave ya quedó protegida en la base de datos
  }
}
