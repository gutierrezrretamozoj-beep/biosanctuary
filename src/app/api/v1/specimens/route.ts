import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantQueryRunner } from "@/lib/db/data-source";

const createSpecimenSchema = z.object({
  enclosure_id: z.string().uuid("El identificador del recinto debe ser un UUID válido"),
  common_name: z.string().min(2, "El nombre común debe tener al menos 2 caracteres"),
  scientific_name: z.string().min(2, "El nombre científico debe tener al menos 2 caracteres"),
  microchip_id: z.string().min(1, "El microchip no puede estar vacío").nullable().optional(),
  rescue_status: z
    .enum(["QUARANTINE", "REHABILITATION", "PERMANENT_RESIDENT", "READY_FOR_RELEASE"], {
      message:
        "Estado clínico de rescate inválido. Opciones: QUARANTINE, REHABILITATION, PERMANENT_RESIDENT, READY_FOR_RELEASE",
    })
    .default("QUARANTINE"),
  weight_kg: z.number().positive("El peso debe ser mayor a 0"),
  arrival_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha de llegada inválido (YYYY-MM-DD)")
    .optional(),
});

/**
 * GET /api/v1/specimens
 * Lista todos los especímenes del tenant incluyendo datos del recinto asociado
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
    const specimens = await queryRunner.query(`
      SELECT 
        s.id,
        s.enclosure_id,
        s.common_name,
        s.scientific_name,
        s.microchip_id,
        s.rescue_status,
        s.weight_kg,
        s.arrival_date,
        s.created_at,
        e.name AS enclosure_name,
        e.bioma_type AS enclosure_bioma,
        e.operational_status AS enclosure_status
      FROM specimens s
      INNER JOIN enclosures e ON e.id = s.enclosure_id
      ORDER BY s.created_at DESC;
    `);

    return NextResponse.json({ data: specimens }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/v1/specimens Error]:", error);
    const message = error instanceof Error ? error.message : "Error al consultar los especímenes";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}

/**
 * POST /api/v1/specimens
 * Registra un nuevo espécimen verificando reglas biológicas y de capacidad del recinto.
 */
export async function POST(request: NextRequest) {
  const schemaName = request.headers.get("x-tenant-schema");

  if (!schemaName) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-schema ausente o no resuelto por middleware" },
      { status: 401 }
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

  const validationResult = createSpecimenSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: validationResult.error.issues[0]?.message || "Datos de entrada inválidos",
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const {
    enclosure_id,
    common_name,
    scientific_name,
    microchip_id,
    rescue_status,
    weight_kg,
    arrival_date,
  } = validationResult.data;

  const resolvedArrivalDate = arrival_date || new Date().toISOString().split("T")[0];
  const cleanMicrochip = microchip_id ? microchip_id.trim() : null;

  const queryRunner = await getTenantQueryRunner(schemaName);
  try {
    // 1. Regla crítica: Consultar si el recinto existe
    const enclosureResult = await queryRunner.query(
      `SELECT id, name, operational_status, capacity 
       FROM enclosures 
       WHERE id = $1 LIMIT 1;`,
      [enclosure_id]
    );

    if (!enclosureResult || enclosureResult.length === 0) {
      return NextResponse.json(
        { error: "El recinto especificado no existe en este santuario" },
        { status: 404 }
      );
    }

    const enclosure = enclosureResult[0];

    // 2. Regla crítica: Recinto bajo reparación o cuarentena bloqueada
    if (
      enclosure.operational_status === "UNDER_REPAIR" ||
      enclosure.operational_status === "QUARANTINE_LOCKED"
    ) {
      return NextResponse.json(
        {
          error: `El recinto "${enclosure.name}" está en estado ${enclosure.operational_status}. Está prohibido ingresar nuevos especímenes a recintos en reparación o bloqueo sanitario.`,
        },
        { status: 409 }
      );
    }

    // 3. Regla de capacidad: Verificar ocupación actual del recinto
    const countResult = await queryRunner.query(
      `SELECT COUNT(*)::int AS current_count FROM specimens WHERE enclosure_id = $1;`,
      [enclosure_id]
    );

    const currentCount = countResult[0]?.current_count || 0;
    if (currentCount >= enclosure.capacity) {
      return NextResponse.json(
        {
          error: `Capacidad máxima del recinto alcanzada (${currentCount}/${enclosure.capacity}). No se permiten más ingresos hasta liberar cupo.`,
        },
        { status: 409 }
      );
    }

    // 4. Regla de microchip único (opcional pero único si se ingresa)
    if (cleanMicrochip) {
      const chipResult = await queryRunner.query(
        `SELECT id FROM specimens WHERE microchip_id = $1 LIMIT 1;`,
        [cleanMicrochip]
      );

      if (chipResult && chipResult.length > 0) {
        return NextResponse.json(
          { error: `El microchip "${cleanMicrochip}" ya se encuentra asignado a otro espécimen.` },
          { status: 409 }
        );
      }
    }

    // 5. Inserción del espécimen
    const insertResult = await queryRunner.query(
      `INSERT INTO specimens (
         enclosure_id, common_name, scientific_name, microchip_id, rescue_status, weight_kg, arrival_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, enclosure_id, common_name, scientific_name, microchip_id, rescue_status, weight_kg, arrival_date, created_at;`,
      [
        enclosure_id,
        common_name.trim(),
        scientific_name.trim(),
        cleanMicrochip,
        rescue_status,
        weight_kg,
        resolvedArrivalDate,
      ]
    );

    const newSpecimen = insertResult[0];

    return NextResponse.json(
      {
        message: "Espécimen registrado exitosamente",
        data: {
          ...newSpecimen,
          enclosure_name: enclosure.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/v1/specimens Error]:", error);
    const message = error instanceof Error ? error.message : "Error al registrar el espécimen";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}
