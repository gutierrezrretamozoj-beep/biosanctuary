import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db/data-source";

/**
 * GET /api/v1/network/sanctuaries
 * Lista los santuarios aliados que tienen habilitada la colaboración en red
 * (allow_network_collaboration = true e is_active = true), excluyendo al tenant actual.
 */
export async function GET(request: NextRequest) {
  const currentTenantId = request.headers.get("x-tenant-id");

  if (!currentTenantId) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-id ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  try {
    const ds = await getDatabaseConnection();
    const sanctuaries = await ds.query(
      `
      SELECT id, slug, name, allow_network_collaboration, created_at
      FROM public.tenants
      WHERE allow_network_collaboration = true
        AND is_active = true
        AND id != $1
      ORDER BY name ASC;
      `,
      [currentTenantId]
    );

    return NextResponse.json({ data: sanctuaries }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/v1/network/sanctuaries Error]:", error);
    const message = error instanceof Error ? error.message : "Error al consultar los santuarios de la red";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
