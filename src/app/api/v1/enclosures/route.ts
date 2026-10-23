import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantQueryRunner } from "@/lib/db/data-source";

const createEnclosureSchema = z.object({
  name: z.string().min(3, "El nombre del recinto debe tener al menos 3 caracteres"),
  bioma_type: z.enum(["JUNGLE", "AQUATIC", "SAVANNA", "DESERT", "FOREST"], {
    message: "Bioma inválido. Opciones válidas: JUNGLE, AQUATIC, SAVANNA, DESERT, FOREST",
  }),
  operational_status: z
    .enum(["OPTIMAL", "MAINTENANCE_REQUIRED", "UNDER_REPAIR", "QUARANTINE_LOCKED"], {
      message:
        "Estado operativo inválido. Opciones: OPTIMAL, MAINTENANCE_REQUIRED, UNDER_REPAIR, QUARANTINE_LOCKED",
    })
    .default("OPTIMAL"),
  capacity: z
    .number()
    .int("La capacidad debe ser un número entero")
    .positive("La capacidad debe ser mayor a 0"),
});

/**
 * GET /api/v1/enclosures
 * Lista todos los recintos del tenant calculando su ocupación actual y cupos disponibles
 */
export async function GET(request: NextRequest) {
  const schemaName = request.headers.get("x-tenant-schema");

  if (!schemaName) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-schema ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  const queryRunner = await getTenantQueryRunner(schemaName);
  try {
    const enclosures = await queryRunner.query(`
      SELECT 
        e.id,
        e.name,
        e.bioma_type,
        e.operational_status,
        e.capacity,
        e.created_at,
        COUNT(s.id)::int AS current_occupancy,
        GREATEST(0, (e.capacity - COUNT(s.id)))::int AS available_slots
      FROM enclosures e
      LEFT JOIN specimens s ON s.enclosure_id = e.id
      GROUP BY e.id, e.name, e.bioma_type, e.operational_status, e.capacity, e.created_at
      ORDER BY e.created_at ASC;
    `);

    return NextResponse.json({ data: enclosures }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/v1/enclosures Error]:", error);
    const message = error instanceof Error ? error.message : "Error al consultar los recintos";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}

/**
 * POST /api/v1/enclosures
 * Crea un nuevo recinto en el hábitat del tenant.
 * RBAC: Solo DIRECTOR_ADMIN o FACILITY_LEAD.
 */
export async function POST(request: NextRequest) {
  const schemaName = request.headers.get("x-tenant-schema");
  const userRole = request.headers.get("x-user-role");

  if (!schemaName) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-schema ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  // Verificación RBAC según directiva y bio-domain-rules
  if (userRole !== "DIRECTOR_ADMIN" && userRole !== "FACILITY_LEAD") {
    return NextResponse.json(
      { error: "Acceso denegado: solo DIRECTOR_ADMIN o FACILITY_LEAD pueden crear recintos" },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido o JSON malformado" },
      { status: 400 }
    );
  }

  const validationResult = createEnclosureSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: validationResult.error.issues[0]?.message || "Datos de entrada inválidos",
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { name, bioma_type, operational_status, capacity } = validationResult.data;

  const queryRunner = await getTenantQueryRunner(schemaName);
  try {
    const insertResult = await queryRunner.query(
      `INSERT INTO enclosures (name, bioma_type, operational_status, capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, bioma_type, operational_status, capacity, created_at;`,
      [name, bioma_type, operational_status, capacity]
    );

    const newEnclosure = insertResult[0];

    return NextResponse.json(
      {
        message: "Recinto creado exitosamente",
        data: {
          ...newEnclosure,
          current_occupancy: 0,
          available_slots: newEnclosure.capacity,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/v1/enclosures Error]:", error);
    const message = error instanceof Error ? error.message : "Error al crear el recinto";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}
