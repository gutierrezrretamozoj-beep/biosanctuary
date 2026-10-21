import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'clave_secreta_por_defecto_de_al_menos_32_caracteres'
);
const COOKIE_NAME = process.env.COOKIE_NAME || 'biosanctuary_session';

export interface UserTokenPayload {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  role: string;
  email: string;
}

/**
 * Genera el JWT con los datos del usuario y del tenant.
 * Cumple con: "El token debe incluir o permitir resolver el tenant del usuario".
 */
export async function signUserToken(payload: UserTokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '8h')
    .sign(JWT_SECRET);
}

/**
 * Valida la firma del token y retorna el payload tipado.
 */
export async function verifyUserToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Guarda la cookie de sesión con directivas de seguridad estrictas.
 * Cumple con: "JWT guardado en una cookie httpOnly, no en localStorage".
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });
}

/**
 * Elimina la cookie de sesión en el cierre de sesión.
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Obtiene la sesión actual leyendo la cookie del request en el servidor.
 */
export async function getSession(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyUserToken(token);
}