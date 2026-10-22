import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth/jwt";

export async function POST() {
  try {
    await deleteSessionCookie();
    return NextResponse.json(
      { message: "Sesión cerrada con éxito" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Logout Error]:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
