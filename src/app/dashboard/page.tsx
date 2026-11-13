import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LivingEcosystemDashboard } from "@/components/dashboard/LivingEcosystemDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const headerList = await headers();
  const schemaName = headerList.get("x-tenant-schema");
  const tenantSlug = headerList.get("x-tenant-slug");
  const userRole = headerList.get("x-user-role");

  // Regla 6.2: Sin valores por defecto inventados. Si falta la sesión o cabecera del tenant, redirigir a login.
  if (!schemaName || !tenantSlug || !userRole) {
    redirect("/login");
  }

  return (
    <main className="w-screen h-screen overflow-hidden">
      <LivingEcosystemDashboard
        initialSchema={schemaName}
        initialSlug={tenantSlug}
        initialRole={userRole}
      />
    </main>
  );
}
