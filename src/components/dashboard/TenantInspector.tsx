"use client";

import React, { useEffect, useState } from "react";
import { Database, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

interface TenantSessionInfo {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  role: string;
  email: string;
}

export function TenantInspector() {
  const [session, setSession] = useState<TenantSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setSession(data.user || data.session);
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
        <Database className="w-3.5 h-3.5" />
        <span>Resolviendo tenant...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-9 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Sesión pública</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Insignia Schema PostgreSQL Activo */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-100 shadow-sm backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 font-mono">
          <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold">Schema:</span>
          <span className="font-bold text-emerald-200">{session.schemaName}</span>
        </div>
      </div>

      {/* Insignia de Rol RBAC */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-200 font-semibold text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span>{session.role}</span>
      </div>
    </div>
  );
}

export default TenantInspector;
