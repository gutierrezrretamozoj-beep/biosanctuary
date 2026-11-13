import React from "react";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Compass,
  PawPrint,
  AlertTriangle,
  Activity,
  ArrowRight,
  Database,
  CheckCircle2,
  Trees,
} from "lucide-react";
import { getTenantQueryRunner } from "@/lib/db/data-source";

export const dynamic = "force-dynamic";

interface EnclosureStat {
  total: number;
  total_capacity: number;
  total_occupancy: number;
  maintenance_count: number;
}

interface SpecimenSummary {
  id: string;
  common_name: string;
  scientific_name: string;
  rescue_status: string;
  arrival_date: string;
  enclosure_name: string;
}

export default async function DashboardPage() {
  const headerList = await headers();
  const schemaName = headerList.get("x-tenant-schema") || "public";
  const tenantSlug = headerList.get("x-tenant-slug") || "default";
  const userRole = headerList.get("x-user-role") || "CUIDADOR";
  const userEmail = headerList.get("x-user-email") || "usuario@biosanctuary.org";

  let statData: EnclosureStat = {
    total: 0,
    total_capacity: 0,
    total_occupancy: 0,
    maintenance_count: 0,
  };
  let recentSpecimens: SpecimenSummary[] = [];

  // Consulta directa en servidor mediante Schema-per-Tenant isolation
  if (schemaName && schemaName !== "public") {
    try {
      const queryRunner = await getTenantQueryRunner(schemaName);
      try {
        const encStats = await queryRunner.query(`
          SELECT 
            COUNT(DISTINCT e.id)::int AS total,
            COALESCE(SUM(e.capacity), 0)::int AS total_capacity,
            COUNT(s.id)::int AS total_occupancy,
            COUNT(DISTINCT CASE WHEN e.operational_status IN ('MAINTENANCE_REQUIRED', 'UNDER_REPAIR', 'QUARANTINE_LOCKED') THEN e.id END)::int AS maintenance_count
          FROM enclosures e
          LEFT JOIN specimens s ON s.enclosure_id = e.id;
        `);
        if (encStats && encStats.length > 0) {
          statData = encStats[0];
        }

        const specimens = await queryRunner.query(`
          SELECT 
            s.id,
            s.common_name,
            s.scientific_name,
            s.rescue_status,
            s.arrival_date,
            e.name AS enclosure_name
          FROM specimens s
          INNER JOIN enclosures e ON e.id = s.enclosure_id
          ORDER BY s.created_at DESC
          LIMIT 5;
        `);
        recentSpecimens = specimens;
      } finally {
        await queryRunner.release();
      }
    } catch (err) {
      console.error("[Dashboard SSR Error]:", err);
    }
  }

  const occupancyPercent =
    statData.total_capacity > 0
      ? Math.round((statData.total_occupancy / statData.total_capacity) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner de Bienvenida y Tenant Activo */}
      <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 mb-2">
            <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Santuario: {tenantSlug}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white">
            Panel de Control Biológico
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 mt-1">
            Sesión activa para <span className="font-semibold text-emerald-700 dark:text-emerald-300">{userEmail}</span> ({userRole})
          </p>
        </div>

        {/* Ficha Diagnóstica del Schema */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 backdrop-blur-md">
          <Database className="w-8 h-8 text-emerald-400 shrink-0" />
          <div className="font-mono text-xs text-emerald-200">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              PostgreSQL Isolated Schema
            </div>
            <div className="text-sm font-black text-white">{schemaName}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>search_path activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Recintos Totales */}
        <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-lg shadow-emerald-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300/70">
              Recintos Activos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950 dark:text-white">
            {statData.total}
          </div>
          <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">
            Hábitats biológicos registrados
          </p>
        </div>

        {/* KPI 2: Fauna Rescatada */}
        <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-lg shadow-emerald-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300/70">
              Fauna en Cuidado
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <PawPrint className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950 dark:text-white">
            {statData.total_occupancy}
          </div>
          <p className="text-xs text-teal-800/70 dark:text-teal-300/70 mt-1">
            Especímenes silvestres albergados
          </p>
        </div>

        {/* KPI 3: Tasa de Ocupación */}
        <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-lg shadow-emerald-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300/70">
              Ocupación de Hábitats
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950 dark:text-white">
            {occupancyPercent}%
          </div>
          <div className="w-full bg-emerald-950/20 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                occupancyPercent > 85 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Alertas de Mantenimiento */}
        <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-lg shadow-emerald-950/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300/70">
              Alertas Operativas
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950 dark:text-white">
            {statData.maintenance_count}
          </div>
          <p className="text-xs text-red-800/70 dark:text-red-300/70 mt-1">
            Recintos en reparación / cuarentena
          </p>
        </div>
      </div>

      {/* Sección Inferior: Ingresos Recientes de Fauna */}
      <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-white">
              Últimos Especímenes Rescatados
            </h2>
            <p className="text-xs text-emerald-900/70 dark:text-emerald-300/70">
              Consultados en tiempo real desde el schema <code>{schemaName}</code>
            </p>
          </div>
          <Link
            href="/dashboard/specimens"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-500 flex items-center gap-1 group"
          >
            <span>Ver todos los animales</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentSpecimens.length === 0 ? (
          <div className="text-center py-10 text-emerald-900/60 dark:text-emerald-300/60 text-xs sm:text-sm">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay especímenes registrados aún. Registra el primer rescate en el módulo de fauna.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-600/15 dark:border-emerald-400/15 text-emerald-900/60 dark:text-emerald-300/60 uppercase font-bold tracking-wider">
                  <th className="pb-3 px-3">Especie / Nombre</th>
                  <th className="pb-3 px-3">Nombre Científico</th>
                  <th className="pb-3 px-3">Recinto</th>
                  <th className="pb-3 px-3">Estado Clínico</th>
                  <th className="pb-3 px-3">Llegada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-600/10 dark:divide-emerald-400/10 font-medium">
                {recentSpecimens.map((specimen) => (
                  <tr key={specimen.id} className="hover:bg-emerald-500/10 transition-colors">
                    <td className="py-3 px-3 font-bold text-emerald-950 dark:text-white">
                      {specimen.common_name}
                    </td>
                    <td className="py-3 px-3 italic text-emerald-800/80 dark:text-emerald-300/80">
                      {specimen.scientific_name}
                    </td>
                    <td className="py-3 px-3 text-emerald-900 dark:text-emerald-200">
                      {specimen.enclosure_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        {specimen.rescue_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-emerald-900/70 dark:text-emerald-300/70">
                      {specimen.arrival_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
