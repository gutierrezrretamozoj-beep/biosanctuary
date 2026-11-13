import React from "react";
import { LivingEcosystemDashboard } from "@/components/dashboard/LivingEcosystemDashboard";

export const dynamic = "force-static";

export default function LandingPage() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <LivingEcosystemDashboard
        initialSchema="tenant_amazonia_wild"
        initialSlug="amazonia-wild"
        initialRole="DIRECTOR_ADMIN"
      />
    </main>
  );
}
