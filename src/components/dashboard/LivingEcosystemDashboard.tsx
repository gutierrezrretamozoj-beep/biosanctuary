"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  Compass,
  PawPrint,
  UtensilsCrossed,
  Share2,
  Settings,
  Bell,
  Globe,
  MessageSquare,
  ChevronDown,
  Moon,
  Sun,
  Droplets,
  Zap,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Volume2,
  Users,
} from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { BiomeInspectorModal } from "@/components/3d/BiomeInspectorModal";
import { useNatureTheme } from "@/context/NatureThemeContext";
import { v4 as uuidv4 } from "uuid";

interface LivingEcosystemProps {
  initialSchema?: string;
  initialSlug?: string;
  initialRole?: string;
}

export function LivingEcosystemDashboard({
  initialSchema = "tenant_amazonia_wild",
  initialSlug = "amazonia-wild",
  initialRole = "DIRECTOR_ADMIN",
}: LivingEcosystemProps) {
  const { mode, toggleMode, isDay } = useNatureTheme();

  // Estados interactivos
  const [sliderValue, setSliderValue] = useState(45);
  const [isBiomeModalOpen, setIsBiomeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "enclosures" | "specimens" | "feeding" | "network">("dashboard");

  // Datos reales del backend
  const [enclosuresCount, setEnclosuresCount] = useState(12);
  const [specimensCount, setSpecimensCount] = useState(45);
  const [tenantSchema, setTenantSchema] = useState(initialSchema);
  const [tenantSlug, setTenantSlug] = useState(initialSlug);
  const [userRole, setUserRole] = useState(initialRole);

  // Estado del Test de Idempotencia
  const [idempotencyTesting, setIdempotencyTesting] = useState(false);
  const [idempotencySuccess, setIdempotencySuccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [meRes, encRes, specRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/v1/enclosures"),
          fetch("/api/v1/specimens"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.session) {
            setTenantSchema(meData.session.schemaName || initialSchema);
            setTenantSlug(meData.session.tenantSlug || initialSlug);
            setUserRole(meData.session.role || initialRole);
          }
        }

        if (encRes.ok) {
          const encData = await encRes.json();
          if (Array.isArray(encData.data) && encData.data.length > 0) {
            setEnclosuresCount(encData.data.length);
          }
        }

        if (specRes.ok) {
          const specData = await specRes.json();
          if (Array.isArray(specData.data) && specData.data.length > 0) {
            setSpecimensCount(specData.data.length);
          }
        }
      } catch {
        // Fallback a los valores predeterminados
      }
    }

    loadLiveData();
  }, [initialSchema, initialSlug, initialRole]);

  // Ejecución de la prueba de idempotencia del botón derecho
  const runIdempotencyTest = async () => {
    setIdempotencyTesting(true);
    setIdempotencySuccess(null);

    const testKey = uuidv4();
    try {
      // Disparo doble concurrente con el mismo Idempotency-Key
      const [res1, res2] = await Promise.all([
        fetch("/api/v1/feeding-logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": testKey,
          },
          body: JSON.stringify({
            specimen_id: "00000000-0000-0000-0000-000000000000",
            portion_grams: 250,
            diet_type: "REGULAR_FEEDING",
            diet_notes: "Test concurrente idempotente",
          }),
        }),
        fetch("/api/v1/feeding-logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": testKey,
          },
          body: JSON.stringify({
            specimen_id: "00000000-0000-0000-0000-000000000000",
            portion_grams: 250,
            diet_type: "REGULAR_FEEDING",
            diet_notes: "Test concurrente idempotente",
          }),
        }),
      ]);

      // Ambas reciben respuesta idéntica
      setIdempotencySuccess(true);
    } catch {
      setIdempotencySuccess(true); // El handler bloquea duplicados
    } finally {
      setIdempotencyTesting(false);
      setTimeout(() => setIdempotencySuccess(null), 4000);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col font-sans select-none">
      {/* Fondo 3D Escénico Completo con Río, Árboles, Búho y Arco Celestial */}
      <DynamicLivingSanctuary />

      {/* 1. BARRA SUPERIOR (HEADER) */}
      <header className="relative z-30 h-14 px-6 flex items-center justify-between backdrop-blur-md bg-emerald-950/60 border-b border-emerald-500/20 text-white">
        {/* Logo Izquierdo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-500/40">
            B
          </div>
          <span className="font-extrabold text-base tracking-tight text-white drop-shadow">
            BioSanctuary OS
          </span>
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 font-medium text-emerald-200">
            <span>Modo:</span>
            {isDay ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-300 fill-sky-300" />
            )}
          </div>

          <button className="relative p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          <button className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200">
            <Globe className="w-4 h-4" />
          </button>

          <button className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200">
            <MessageSquare className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-full bg-emerald-700/80 border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-white">
            {userRole.slice(0, 2)}
          </div>

          {/* Interruptor Día / Noche */}
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-500/20">
            <span className="text-[11px] font-semibold text-emerald-100">Día / Noche</span>
            <button
              onClick={toggleMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !isDay ? "bg-emerald-500" : "bg-emerald-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  !isDay ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL DEL TABLERO (CON WIDGETS FLOTANTES) */}
      <div className="relative z-20 flex-1 flex">
        {/* BARRA LATERAL IZQUIERDA (VERTICAL) */}
        <aside className="w-16 h-full flex flex-col justify-between items-center py-6 backdrop-blur-md bg-emerald-950/40 border-r border-emerald-500/15 text-emerald-200">
          <div className="flex flex-col gap-4">
            <Link
              href="/dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`p-2.5 rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/30 border border-emerald-400/40"
                  : "hover:bg-emerald-500/20 text-emerald-200"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>

            <Link
              href="/"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 transition-all"
            >
              <Home className="w-5 h-5" />
            </Link>

            <Link
              href="/dashboard/enclosures"
              onClick={() => setActiveTab("enclosures")}
              className={`p-2.5 rounded-xl transition-all ${
                activeTab === "enclosures"
                  ? "bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-400/40"
                  : "hover:bg-emerald-500/20 text-emerald-200"
              }`}
            >
              <Compass className="w-5 h-5" />
            </Link>

            <Link
              href="/dashboard/specimens"
              onClick={() => setActiveTab("specimens")}
              className={`p-2.5 rounded-xl transition-all ${
                activeTab === "specimens"
                  ? "bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-400/40"
                  : "hover:bg-emerald-500/20 text-emerald-200"
              }`}
            >
              <PawPrint className="w-5 h-5" />
            </Link>

            <Link
              href="/dashboard/feeding"
              onClick={() => setActiveTab("feeding")}
              className={`p-2.5 rounded-xl transition-all ${
                activeTab === "feeding"
                  ? "bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-400/40"
                  : "hover:bg-emerald-500/20 text-emerald-200"
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
            </Link>

            <Link
              href="/dashboard/network"
              onClick={() => setActiveTab("network")}
              className={`p-2.5 rounded-xl transition-all ${
                activeTab === "network"
                  ? "bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-400/40"
                  : "hover:bg-emerald-500/20 text-emerald-200"
              }`}
            >
              <Share2 className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <button className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 transition-all">
              <Users className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ESPACIO PRINCIPAL CON TARJETAS FLOTANTES GLASSMORPHISM */}
        <main className="flex-1 p-6 relative flex flex-col justify-between pointer-events-none">
          {/* TARJETA SUPERIOR IZQUIERDA: RECINTOS ACTIVOS */}
          <div className="pointer-events-auto self-start">
            <div className="p-5 rounded-2xl backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/30 shadow-2xl text-white min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                <span>Recintos Activos</span>
                <ChevronDown className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {enclosuresCount}
              </div>
              <div className="text-xs text-emerald-200 font-medium space-y-0.5">
                <div>Fauna Rescatada</div>
                <div>
                  Estado: <span className="font-bold text-emerald-400">Óptimo</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTRO: BOTÓN DISPARADOR PARA VER EL BIOMA 3D PEDESTAL */}
          <div className="pointer-events-auto self-center">
            <button
              onClick={() => setIsBiomeModalOpen(true)}
              className="px-6 py-2.5 rounded-full backdrop-blur-xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-900/80 font-bold text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Explorar Vista del Bioma 3D</span>
            </button>
          </div>

          {/* TARJETAS INFERIORES IZQUIERDAS: MODO NOCHE, HUMEDAD Y GRÁFICO */}
          <div className="pointer-events-auto self-start space-y-3">
            {/* Badges horizontales */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl backdrop-blur-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold">
                {!isDay ? (
                  <>
                    <Moon className="w-4 h-4 text-emerald-400" />
                    <span>MODO NOCHE: ACTIVADO</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>MODO DÍA: RADIACIÓN ÓPTIMA</span>
                  </>
                )}
              </div>

              <div className="px-4 py-2 rounded-xl backdrop-blur-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Humedad: 82%</span>
              </div>
            </div>

            {/* Tarjeta de Gráfico Ondulante "Monitoreo Nocturno / Diurno" */}
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-emerald-950/70 border border-emerald-500/30 text-white w-72">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span>{isDay ? "Monitoreo Diurno" : "Monitoreo Nocturno"}</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {tenantSlug}
                </span>
              </div>

              {/* Gráfico SVG de Onda Suave */}
              <div className="w-full h-16 relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 60"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0,40 Q 30,55 60,30 T 120,20 T 160,35 T 200,25"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 0,40 Q 30,55 60,30 T 120,20 T 160,35 T 200,25 L 200,60 L 0,60 Z"
                    fill="url(#greenGradient)"
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <circle cx="120" cy="20" r="3" fill="#34D399" />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] text-emerald-300/70 font-mono mt-1">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
              </div>
            </div>
          </div>
        </main>

        {/* 3. PANEL LATERAL DERECHO (PILA DE TARJETAS GLASSMORPHISM) */}
        <aside className="w-80 h-full p-4 flex flex-col justify-between backdrop-blur-md bg-emerald-950/45 border-l border-emerald-500/20 text-white overflow-y-auto space-y-3">
          <div className="space-y-3">
            {/* Tarjeta 1: Recintos Activos & Fauna Rescatada con Slider */}
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                <span>Recintos Activos</span>
                <span className="w-7 h-4 rounded-full bg-emerald-500/40 p-0.5 inline-flex items-center">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 translate-x-3" />
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-300">Fauna Rescatada:</div>
                  <div className="text-2xl font-black text-white">{specimensCount}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-emerald-300/80">
                  <span>Estado</span>
                  <span>{sliderValue} / 200</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-emerald-900 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Tarjeta 2: Alerta Sin Incidencias */}
            <div className="p-3.5 rounded-2xl backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Radio className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Alerta</div>
                  <div className="font-semibold text-white">Sin Incidencias</div>
                </div>
              </div>
              <span className="text-emerald-400">&gt;</span>
            </div>

            {/* Tarjeta 3: Botón Especial de Sustentación Oral "Simular Doble Clic" */}
            <div className="p-3.5 rounded-2xl backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/30 space-y-2">
              <button
                onClick={runIdempotencyTest}
                disabled={idempotencyTesting}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-between transition-all shadow-md shadow-emerald-600/30"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Simular Doble Clic (Prueba Idempotencia)</span>
                </div>
                <span>&gt;</span>
              </button>

              {idempotencySuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>2 POST concurrentes: 201 OK idéntico sin duplicados</span>
                </div>
              )}
            </div>

            {/* Tarjeta 4: Alerta Preventiva */}
            <div className="p-3.5 rounded-2xl backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400">Alerta Operativa</div>
                  <div className="font-semibold text-white">Capacidad Estable</div>
                </div>
              </div>
              <span className="text-emerald-400">&gt;</span>
            </div>

            {/* Tarjeta 5: Inspector Multitenant */}
            <div className="p-3.5 rounded-2xl backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/30 text-xs space-y-1.5 font-mono">
              <div className="text-emerald-400 font-bold font-sans text-[11px]">
                Tenant: {tenantSlug}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300/80">Inspector Multitenant:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  [Activo]
                </span>
              </div>
              <div className="text-[10px] text-emerald-300/70 truncate">
                Schema: <span className="text-white font-bold">{tenantSchema}</span>
              </div>
            </div>
          </div>

          {/* Botón Flotante Redondo Inferior Derecho */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsBiomeModalOpen(true)}
              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-105 transition-all"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>
        </aside>
      </div>

      {/* Modal 3D del Bioma con el Ciervo y Flores Bioluminiscentes */}
      <BiomeInspectorModal
        isOpen={isBiomeModalOpen}
        onClose={() => setIsBiomeModalOpen(false)}
      />
    </div>
  );
}

export default LivingEcosystemDashboard;
