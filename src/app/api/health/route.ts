import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Tenant } from "@/lib/db/entities/Tenant";

export async function GET(_request: NextRequest) {
  try {
    const ds = await getDataSource();
    const tenantRepository = ds.getRepository(Tenant);
    const tenants = await tenantRepository.find({
      order: {
        created_at: "ASC",
      },
    });

    return NextResponse.json(
      {
        status: "online",
        day: 1,
        message: "Entorno y base de datos configurados con éxito",
        tenants_count: tenants.length,
        tenants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SmokeTest /api/health Error]:", error);
    return NextResponse.json(
      {
        status: "error",
        day: 1,
        message: "Error al conectar con la base de datos Supabase",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
