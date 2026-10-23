import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantQueryRunner } from "@/lib/db/data-source";

const updateEnclosureSchema = z
  .object({
    operational_status: z
      .enum(["OPTIMAL", "MAINTENANCE_REQUIRED", "UNDER_REPAIR", "QUARANTINE_LOCKED"], {
        message:
          "Estado operativo inválido. Opciones: OPTIMAL, MAINTENANCE_REQUIRED, UNDER_REPAIR, QUARANTINE_LOCKED",
      })
      .optional(),
    capacity: z
      .number()
      .int("La capacidad debe ser un número entero")
      .positive("La capacidad debe ser mayor a 0")
      .optional(),
  })
  .refine(
    (data) => data.operational_status !== undefined || data.capacity !== undefined,
    {
      message: "Debe proporcionar al menos 'operational_status' o 'capacity' para actualizar",
    }
  );

/**
 * PATCH /api/v1/enclosures/[id]
 * Actualiza el estado operativo y/o la capacidad de un recinto.
 * RBAC: Solo DIRECTOR_ADMIN o FACILITY_LEAD.
 * Regla de negocio: Si se cambia a UNDER_REPAIR o QUARANTINE_LOCKED con fauna residente -> 409 Conflict.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const schemaName = request.headers.get("x-tenant-schema");
  const userRole = request.headers.get("x-user-role");

  if (!schemaName) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-schema ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  // Verificación RBAC
  if (userRole !== "DIRECTOR_ADMIN" && userRole !== "FACILITY_LEAD") {
    return NextResponse.json(
      {
        error:
          "Acceso denegado: solo DIRECTOR_ADMIN o FACILITY_LEAD pueden modificar el estado de los recintos",
      },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Identificador de recinto requerido" }, { status: 400 });
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

  const validationResult = updateEnclosureSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: validationResult.error.issues[0]?.message || "Datos de entrada inválidos",
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { operational_status, capacity } = validationResult.data;

  const queryRunner = await getTenantQueryRunner(schemaName);
  try {
    // 1. Verificar existencia del recinto
    const enclosureResult = await queryRunner.query(
      `SELECT id, name, bioma_type, operational_status, capacity, created_at 
       FROM enclosures 
       WHERE id = $1 LIMIT 1;`,
      [id]
    );

    if (!enclosureResult || enclosureResult.length === 0) {
      return NextResponse.json({ error: "Recinto no encontrado" }, { status: 404 });
    }

    const currentEnclosure = enclosureResult[0];

    // 2. Consultar conteo actual de especímenes en el recinto
    const occupancyResult = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM specimens WHERE enclosure_id = $1;`,
      [id]
    );
    const currentOccupancy = occupancyResult[0]?.count || 0;

    // 3. Regla crítica: Si cambia a UNDER_REPAIR o QUARANTINE_LOCKED, debe estar vacío
    if (
      operational_status &&
      (operational_status === "UNDER_REPAIR" || operational_status === "QUARANTINE_LOCKED")
    ) {
      if (currentOccupancy > 0) {
        return NextResponse.json(
          {
            error: `Conflicto operativo: el recinto alberga actualmente ${currentOccupancy} espécimen(es). Deben ser reubicados a otro hábitat antes de iniciar mantenimiento o bloqueo sanitario.`,
            current_occupancy: currentOccupancy,
          },
          { status: 409 }
        );
      }
    }

    // 4. Regla de capacidad: La nueva capacidad no puede ser inferior a la ocupación actual
    if (capacity !== undefined && capacity < currentOccupancy) {
      return NextResponse.json(
        {
          error: `Conflicto de capacidad: no se puede reducir la capacidad a ${capacity} porque el recinto alberga actualmente ${currentOccupancy} especímenes.`,
          current_occupancy: currentOccupancy,
        },
        { status: 409 }
      );
    }

    // 5. Construir actualización dinámica
    const newStatus = operational_status !== undefined ? operational_status : currentEnclosure.operational_status;
    const newCapacity = capacity !== undefined ? capacity : currentEnclosure.capacity;

    const updateResult = await queryRunner.query(
      `UPDATE enclosures
       SET operational_status = $1, capacity = $2
       WHERE id = $3
       RETURNING id, name, bioma_type, operational_status, capacity, created_at;`,
      [newStatus, newCapacity, id]
    );

    const updated = updateResult[0];

    return NextResponse.json(
      {
        message: "Recinto actualizado exitosamente",
        data: {
          ...updated,
          current_occupancy: currentOccupancy,
          available_slots: Math.max(0, updated.capacity - currentOccupancy),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[PATCH /api/v1/enclosures/[id] Error]:", error);
    const message = error instanceof Error ? error.message : "Error al actualizar el recinto";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
}

