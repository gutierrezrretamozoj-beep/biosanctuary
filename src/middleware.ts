import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "biosanctuary_session";

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "clave_secreta_super_segura_biosanctuary_os_2026_min_32_chars";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren validación estricta de sesión
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname === "/api/health" ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Extraer token desde la cookie biosanctuary_session (o Authorization Bearer de respaldo)
  const token =
    request.cookies.get(COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  // Si no hay token en rutas protegidas de API (/api/v1/*)
  if (!token) {
    if (pathname.startsWith("/api/v1")) {
      return NextResponse.json(
        { error: "No autenticado. Token o sesión ausente." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.schemaName || !payload.tenantId) {
      if (pathname.startsWith("/api/v1")) {
        return NextResponse.json(
          { error: "Sesión inválida: información de tenant ausente." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // Inyección de headers para resolución del tenant según .agent/skills/multitenant-isolation
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-schema", payload.schemaName as string);
    requestHeaders.set("x-tenant-id", payload.tenantId as string);
    requestHeaders.set("x-tenant-slug", (payload.tenantSlug as string) || "");
    requestHeaders.set("x-user-id", (payload.userId as string) || "");
    requestHeaders.set("x-user-role", (payload.role as string) || "");
    requestHeaders.set("x-user-email", (payload.email as string) || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (pathname.startsWith("/api/v1")) {
      return NextResponse.json(
        { error: "Sesión expirada o token inválido." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Intercepta todas las rutas excepto archivos estáticos
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
