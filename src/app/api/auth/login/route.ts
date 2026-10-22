import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDatabaseConnection } from "@/lib/db/data-source";
import { signUserToken, setSessionCookie, UserTokenPayload } from "@/lib/auth/jwt";

const loginSchema = z.object({
  email: z.string().email("El formato del correo electrónico es inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

interface UserQueryResult {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
  tenant_slug: string;
  schema_name: string;
  tenant_active: boolean;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de solicitud inválido o JSON malformado" },
        { status: 400 }
      );
    }

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Error de validación",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // 2. Obtener conexión a través de getDatabaseConnection()
    const ds = await getDatabaseConnection();

    // 3. Consultar en public.users con INNER JOIN a public.tenants
    const users: UserQueryResult[] = await ds.query(
      `SELECT u.id, u.tenant_id, u.email, u.password_hash, u.full_name, u.role, u.is_active,
              t.slug as tenant_slug, t.schema_name, t.is_active as tenant_active
       FROM public.users u
       INNER JOIN public.tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
       LIMIT 1;`,
      [email]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Usuario inactivo. Por favor contacte a la administración del santuario." },
        { status: 403 }
      );
    }

    // Verificar si el santuario/tenant está activo
    if (!user.tenant_active) {
      return NextResponse.json(
        { error: "El santuario o tenant asociado se encuentra inactivo." },
        { status: 403 }
      );
    }

    // Comparación segura del hash de contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Estructurar el payload del token
    const tokenPayload: UserTokenPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      tenantSlug: user.tenant_slug,
      schemaName: user.schema_name,
      role: user.role,
      email: user.email,
    };

    // Firmar JWT y establecer cookie httpOnly
    const token = await signUserToken(tokenPayload);
    await setSessionCookie(token);

    // Responder con datos públicos del usuario y tenant (sin hash de contraseña)
    return NextResponse.json(
      {
        message: "Autenticación exitosa",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
          tenantSlug: user.tenant_slug,
          schemaName: user.schema_name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Login Error]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor durante el inicio de sesión" },
      { status: 500 }
    );
  }
}
