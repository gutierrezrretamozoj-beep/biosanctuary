"use client";

import { useState, useEffect } from "react";
import { AuthUser, UserRole } from "@/types";
import { apiFetch } from "@/lib/api/client";

export function useRole() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadMe() {
      try {
        const data = await apiFetch<{ authenticated: boolean; user: AuthUser }>("/api/auth/me", {
          signal: controller.signal,
        });
        if (active && data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMe();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const role: UserRole | null = user?.role || null;
  const isDirectorAdmin = role === "DIRECTOR_ADMIN";
  const isFacilityLead = role === "FACILITY_LEAD";
  const isVetOfficer = role === "VET_OFFICER";
  const isZookeeper = role === "ZOOKEEPER";

  const canManageEnclosures = isDirectorAdmin || isFacilityLead;
  const canManageSpecimenStatus = isDirectorAdmin || isVetOfficer;
  const canLogFeeding = isDirectorAdmin || isZookeeper;

  return {
    user,
    role,
    loading,
    isDirectorAdmin,
    isFacilityLead,
    isVetOfficer,
    isZookeeper,
    canManageEnclosures,
    canManageSpecimenStatus,
    canLogFeeding,
  };
}
