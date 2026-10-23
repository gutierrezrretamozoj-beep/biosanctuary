import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDatabaseConnection } from "@/lib/db/data-source";
import { signUserToken, setSessionCookie } from "@/lib/auth/jwt";

// 1. Esquema de validación con Zod (Requisito 4.3)
const registerTenantSchema = z.object({
  sanctuaryName: z
    .string()
    .min(3, "El nombre del santuario debe tener al menos 3 caracteres"),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(50, "El slug no puede superar 50 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener minúsculas, números y guiones (-)"
    ),
  allowCollaboration: z.boolean().default(false),
  adminName: z
    .string()
    .min(3, "El nombre del administrador debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de solicitud inválido o JSON malformado" },
        { status: 400 }
      );
    }

    const validationResult = registerTenantSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.issues[0]?.message ||
            "Datos de entrada inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const ds = await getDatabaseConnection();

    // 2. Comprobar disponibilidad de slug y correo antes de invocar la transacción
    const existingSlug = await ds.query(
      `SELECT id FROM public.tenants WHERE slug = $1 LIMIT 1`,
      [validatedData.slug]
    );

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "El slug ya se encuentra registrado por otro santuario." },
        { status: 409 }
      );
    }

    const existingEmail = await ds.query(
      `SELECT id FROM public.users WHERE lower(email) = lower($1) LIMIT 1`,
      [validatedData.email.trim()]
    );

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado en la plataforma." },
        { status: 409 }
      );
    }

    // 3. Hashear la contraseña con salt seguro
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // 4. Invocar la función transaccional de PostgreSQL en Supabase
    const result = await ds.query(
      `SELECT public.provision_new_tenant($1, $2, $3, $4, $5, $6) AS provision_result`,
      [
        validatedData.sanctuaryName,
        validatedData.slug,
        validatedData.allowCollaboration,
        validatedData.adminName,
        validatedData.email.toLowerCase().trim(),
        passwordHash,
      ]
    );

    const provisionData = result[0]?.provision_result;
    if (!provisionData) {
      throw new Error(
        "La función de aprovisionamiento no retornó datos válidos"
      );
    }

    // 5. Generar token JWT con el schema resuelto
    const token = await signUserToken({
      userId: provisionData.user_id,
      tenantId: provisionData.tenant_id,
      tenantSlug: validatedData.slug,
      schemaName: provisionData.schema_name,
      role: "DIRECTOR_ADMIN",
      email: validatedData.email.toLowerCase().trim(),
    });

    // 6. Asignar la cookie httpOnly (Requisito 4.2)
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Santuario y schema aprovisionados correctamente.",
        tenant: {
          id: provisionData.tenant_id,
          slug: validatedData.slug,
          schemaName: provisionData.schema_name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error al aprovisionar tenant:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al aprovisionar el santuario";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
