import React from "react";
import { headers } from "next/headers";
import { LivingEcosystemDashboard } from "@/components/dashboard/LivingEcosystemDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const headerList = await headers();
  const schemaName = headerList.get("x-tenant-schema") || "tenant_amazonia_wild";
  const tenantSlug = headerList.get("x-tenant-slug") || "amazonia-wild";
  const userRole = headerList.get("x-user-role") || "DIRECTOR_ADMIN";

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
