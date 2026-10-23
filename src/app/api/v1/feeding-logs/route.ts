import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantQueryRunner } from "@/lib/db/data-source";

const createFeedingLogSchema = z.object({
  specimen_id: z.string().uuid("El identificador del espécimen debe ser un UUID válido"),
  portion_grams: z
    .number()
    .positive("La porción en gramos debe ser estrictamente mayor a 0"),
  diet_type: z.enum(["REGULAR_FEEDING", "MEDICAL_TREATMENT", "EMERGENCY_SUPPLEMENT"], {
    message:
      "Tipo de alimentación inválido. Opciones: REGULAR_FEEDING, MEDICAL_TREATMENT, EMERGENCY_SUPPLEMENT",
  }),
  diet_notes: z.string().min(3, "Las notas de dieta deben tener al menos 3 caracteres"),
});

/**
 * GET /api/v1/feeding-logs
 * Consulta el historial nutricional y clínico de los animales.
 * Soporta filtro opcional ?specimenId=<uuid>.
 * Incluye datos del cuidador (public.users) y del espécimen (specimens).
 */
export async function GET(request: NextRequest) {
  const schemaName = request.headers.get("x-tenant-schema");

  if (!schemaName) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-schema ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const specimenId = searchParams.get("specimenId");

  const queryRunner = await getTenantQueryRunner(schemaName);
  try {
    let query = `
      SELECT 
        fl.id,
        fl.specimen_id,
        fl.keeper_id,
        fl.diet_type,
        fl.portion_grams,
        fl.diet_notes,
        fl.fed_at,
        s.common_name AS specimen_common_name,
        s.scientific_name AS specimen_scientific_name,
        u.full_name AS keeper_name,
        u.email AS keeper_email,
        u.role AS keeper_role
      FROM feeding_logs fl
      INNER JOIN specimens s ON s.id = fl.specimen_id
      LEFT JOIN public.users u ON u.id = fl.keeper_id
    `;

    const params: string[] = [];
    if (specimenId) {
      params.push(specimenId);
      query += ` WHERE fl.specimen_id = $1`;
    }

    query += ` ORDER BY fl.fed_at DESC;`;

    const logs = await queryRunner.query(query, params);

    return NextResponse.json({ data: logs }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/v1/feeding-logs Error]:", error);
    const message = error instanceof Error ? error.message : "Error al consultar la bitácora de alimentación";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}

/**
 * POST /api/v1/feeding-logs
 * Registra una ingesta o tratamiento médico para un espécimen.
 * Asigna keeper_id automáticamente desde el usuario autenticado (x-user-id).
 */
export async function POST(request: NextRequest) {
  const schemaName = request.headers.get("x-tenant-schema");
  const userId = request.headers.get("x-user-id");

  if (!schemaName) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-schema ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Usuario no autenticado o encabezado x-user-id ausente" },
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

  const validationResult = createFeedingLogSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: validationResult.error.issues[0]?.message || "Datos de entrada inválidos",
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { specimen_id, portion_grams, diet_type, diet_notes } = validationResult.data;

  const queryRunner = await getTenantQueryRunner(schemaName);
  try {
    // 1. Validar que el espécimen exista en el schema activo
    const specimenResult = await queryRunner.query(
      `SELECT id, common_name, scientific_name FROM specimens WHERE id = $1 LIMIT 1;`,
      [specimen_id]
    );

    if (!specimenResult || specimenResult.length === 0) {
      return NextResponse.json(
        { error: "El espécimen indicado no existe en este santuario" },
        { status: 404 }
      );
    }

    const specimen = specimenResult[0];

    // 2. Insertar en feeding_logs
    const insertResult = await queryRunner.query(
      `INSERT INTO feeding_logs (specimen_id, keeper_id, diet_type, portion_grams, diet_notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, specimen_id, keeper_id, diet_type, portion_grams, diet_notes, fed_at;`,
      [specimen_id, userId, diet_type, portion_grams, diet_notes.trim()]
    );

    const newLog = insertResult[0];

    return NextResponse.json(
      {
        message: "Registro de alimentación registrado exitosamente",
        data: {
          ...newLog,
          specimen_common_name: specimen.common_name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/v1/feeding-logs Error]:", error);
    const message = error instanceof Error ? error.message : "Error al registrar la alimentación";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}

