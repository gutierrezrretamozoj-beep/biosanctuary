import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "No autenticado. Sesión no encontrada o token inválido." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: session,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Permitir que Next.js maneje internamente las señales de control de flujo dinámico durante prerender
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as { digest?: string }).digest === "HANGING_PROMISE_REJECTION"
    ) {
      throw error;
    }

    console.error("[AuthMe Error]:", error);
    return NextResponse.json(
      { error: "Error al consultar la sesión del usuario" },
      { status: 500 }
    );
  }
}
