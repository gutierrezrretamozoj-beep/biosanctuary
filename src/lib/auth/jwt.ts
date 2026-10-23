import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/lib/db/entities/User";

export const COOKIE_NAME = "biosanctuary_session";

export interface UserTokenPayload {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  role: UserRole | string;
  email: string;
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "clave_secreta_super_segura_biosanctuary_os_2026_min_32_chars";
  return new TextEncoder().encode(secret);
}

/**
 * Firma un JWT con algoritmo HS256 y tiempo de expiración configurable (por defecto 8h).
 * El payload incluye obligatoriamente: userId, tenantId, tenantSlug, schemaName, role, email.
 */
export async function signUserToken(
  payload: UserTokenPayload,
  expiresIn: string = process.env.JWT_EXPIRES_IN || "8h"
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

/**
 * Valida la firma del token y retorna el payload tipado, o null si falló la validación o expiró.
 */
export async function verifyUserToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    if (
      !payload.userId ||
      !payload.tenantId ||
      !payload.tenantSlug ||
      !payload.schemaName ||
      !payload.role ||
      !payload.email
    ) {
      return null;
    }

    return {
      userId: payload.userId as string,
      tenantId: payload.tenantId as string,
      tenantSlug: payload.tenantSlug as string,
      schemaName: payload.schemaName as string,
      role: payload.role as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/**
 * Asigna la cookie de sesión httpOnly usando cookies() de next/headers.
 * Flags: httpOnly: true, secure: production, sameSite: 'lax', path: '/', maxAge: 8 horas.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas en segundos
  });
}

/**
 * Elimina la cookie biosanctuary_session.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Lee la cookie biosanctuary_session del request entrante y valida el token.
 * Retorna el payload del usuario autenticado o null.
 */
export async function getSession(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyUserToken(token);
}
