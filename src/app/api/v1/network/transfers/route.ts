import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabaseConnection } from "@/lib/db/data-source";
import { checkNetworkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

const createTransferSchema = z.object({
  to_tenant_id: z.string().uuid("El identificador del santuario receptor debe ser un UUID válido"),
  species_name: z.string().min(2, "El nombre de la especie debe tener al menos 2 caracteres"),
  urgency: z
    .enum(["STANDARD", "HIGH", "CRITICAL"], {
      message: "Nivel de urgencia inválido. Opciones: STANDARD, HIGH, CRITICAL",
    })
    .default("STANDARD"),
  reason: z.string().min(5, "El motivo de la derivación debe tener al menos 5 caracteres"),
});

/**
 * GET /api/v1/network/transfers
 * Consulta las solicitudes de traslado inter-santuario entrantes y salientes del tenant actual.
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
    const transfers = await ds.query(
      `
      SELECT 
        tr.id,
        tr.from_tenant_id,
        tr.to_tenant_id,
        tr.species_name,
        tr.urgency,
        tr.reason,
        tr.status,
        tr.created_at,
        t_from.name AS from_sanctuary_name,
        t_from.slug AS from_sanctuary_slug,
        t_to.name AS to_sanctuary_name,
        t_to.slug AS to_sanctuary_slug,
        CASE 
          WHEN tr.from_tenant_id = $1 THEN 'OUTGOING'
          ELSE 'INCOMING'
        END AS direction
      FROM public.transfer_requests tr
      INNER JOIN public.tenants t_from ON t_from.id = tr.from_tenant_id
      INNER JOIN public.tenants t_to ON t_to.id = tr.to_tenant_id
      WHERE tr.from_tenant_id = $1 OR tr.to_tenant_id = $1
      ORDER BY tr.created_at DESC;
      `,
      [currentTenantId]
    );

    return NextResponse.json({ data: transfers }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/v1/network/transfers Error]:", error);
    const message = error instanceof Error ? error.message : "Error al consultar las solicitudes de traslado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/v1/network/transfers
 * Crea una nueva solicitud de traslado inter-santuario por motivos de capacidad o atención especializada.
 * Rate Limiting: 10 peticiones por minuto.
 */
export async function POST(request: NextRequest) {
  const currentTenantId = request.headers.get("x-tenant-id");

  if (!currentTenantId) {
    return NextResponse.json(
      { error: "Encabezado x-tenant-id ausente o no resuelto por middleware" },
      { status: 401 }
    );
  }

  // 1. Rate Limiting de red (10 req/min)
  const rl = await checkNetworkRateLimit(currentTenantId);
  if (!rl.success) {
    return rateLimitResponse(
      rl.retryAfterSeconds,
      "Límite de solicitudes de red inter-santuario excedido"
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

  const validationResult = createTransferSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: validationResult.error.issues[0]?.message || "Datos de entrada inválidos",
        details: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { to_tenant_id, species_name, urgency, reason } = validationResult.data;

  // No permitir transferencias al mismo santuario
  if (to_tenant_id === currentTenantId) {
    return NextResponse.json(
      { error: "El santuario receptor no puede ser el mismo santuario emisor" },
      { status: 400 }
    );
  }

  try {
    const ds = await getDatabaseConnection();

    // 2. Verificar que el santuario receptor exista, esté activo y permita colaboración
    const targetSanctuary = await ds.query(
      `
      SELECT id, name, is_active, allow_network_collaboration
      FROM public.tenants
      WHERE id = $1
      LIMIT 1;
      `,
      [to_tenant_id]
    );

    if (!targetSanctuary || targetSanctuary.length === 0) {
      return NextResponse.json(
        { error: "El santuario receptor especificado no existe" },
        { status: 404 }
      );
    }

    const target = targetSanctuary[0];

    if (!target.is_active) {
      return NextResponse.json(
        { error: "El santuario receptor se encuentra inactivo actualmente" },
        { status: 400 }
      );
    }

    if (!target.allow_network_collaboration) {
      return NextResponse.json(
        { error: `El santuario "${target.name}" no tiene habilitada la red de colaboración inter-santuarios` },
        { status: 400 }
      );
    }

    // 3. Insertar la solicitud de traslado
    const insertResult = await ds.query(
      `
      INSERT INTO public.transfer_requests (from_tenant_id, to_tenant_id, species_name, urgency, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING id, from_tenant_id, to_tenant_id, species_name, urgency, reason, status, created_at;
      `,
      [currentTenantId, to_tenant_id, species_name.trim(), urgency, reason.trim()]
    );

    const newTransfer = insertResult[0];

    return NextResponse.json(
      {
        message: "Solicitud de traslado inter-santuario creada exitosamente",
        data: {
          ...newTransfer,
          to_sanctuary_name: target.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/v1/network/transfers Error]:", error);
    const message = error instanceof Error ? error.message : "Error al crear la solicitud de traslado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
