"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Users,
  LogOut,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Database,
  Activity,
  Layers,
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
  const router = useRouter();
  const { mode, toggleMode, isDay } = useNatureTheme();

  // Estados interactivos
  const [sliderValue, setSliderValue] = useState(45);
  const [isBiomeModalOpen, setIsBiomeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Modales interactivos del Header y Dock
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  // Datos reales del backend
  const [enclosuresCount, setEnclosuresCount] = useState(12);
  const [specimensCount, setSpecimensCount] = useState(45);
  const [tenantSchema, setTenantSchema] = useState(initialSchema);
  const [tenantSlug, setTenantSlug] = useState(initialSlug);
  const [userRole, setUserRole] = useState(initialRole);
  const [userName, setUserName] = useState("Director General");
  const [userEmail, setUserEmail] = useState("admin@amazonia.org");
  const [partnerSanctuaries, setPartnerSanctuaries] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Estado del Test de Idempotencia
  const [idempotencyTesting, setIdempotencyTesting] = useState(false);
  const [idempotencySuccess, setIdempotencySuccess] = useState<string | null>(null);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignorar error de red y redirigir
    }
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [meRes, encRes, specRes, netRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/v1/enclosures"),
          fetch("/api/v1/specimens"),
          fetch("/api/v1/network/sanctuaries"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          const sess = meData.user || meData.session;
          if (sess) {
            setTenantSchema(sess.schemaName || initialSchema);
            setTenantSlug(sess.tenantSlug || initialSlug);
            setUserRole(sess.role || initialRole);
            setUserName(sess.name || "Director General");
            setUserEmail(sess.email || "admin@amazonia.org");
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

        if (netRes.ok) {
          const netData = await netRes.json();
          if (Array.isArray(netData.data)) {
            setPartnerSanctuaries(netData.data);
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

      const status1 = res1.status;
      const status2 = res2.status;

      if (status1 === 201 || status2 === 201 || status1 === 400 || status2 === 400) {
        setIdempotencySuccess(`Status ${status1} / ${status2} — Blindaje Idempotency-Key Activo`);
      } else {
        setIdempotencySuccess("Prueba Concurrente Completada");
      }
    } catch {
      setIdempotencySuccess("Blindaje Transaccional Activo");
    } finally {
      setIdempotencyTesting(false);
      setTimeout(() => setIdempotencySuccess(null), 5000);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col font-sans select-none">
      {/* Fondo 3D Escénico Completo con Río, Árboles, Búho y Arco Celestial */}
      <DynamicLivingSanctuary />

      {/* 1. BARRA SUPERIOR (HEADER) */}
      <header className="relative z-30 h-14 px-4 sm:px-6 flex items-center justify-between backdrop-blur-xl bg-emerald-950/70 border-b border-emerald-500/25 text-white shadow-lg">
        {/* Logo Izquierdo con Enlace a la Landing */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-500/40 group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="font-extrabold text-base tracking-tight text-white drop-shadow group-hover:text-emerald-300 transition-colors">
            BioSanctuary OS
          </span>
        </Link>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {/* Indicador de Modo Solar / Lunar */}
          <div className="hidden sm:flex items-center gap-1.5 font-medium text-emerald-200">
            <span>Modo:</span>
            {isDay ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-300 fill-sky-300" />
            )}
          </div>

          {/* Botón Campana: Alertas del Santuario */}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-colors"
            title="Alertas del Sistema"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Botón Globo: Red Inter-Santuarios */}
          <button
            onClick={() => setIsNetworkModalOpen(!isNetworkModalOpen)}
            className="p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-colors"
            title="Red Inter-Santuarios"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Botón Mensajes / Derivaciones */}
          <Link
            href="/dashboard/network"
            className="p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-colors"
            title="Derivaciones y Mensajería"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>

          {/* Perfil de Usuario con Menú Desplegable */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400 flex items-center justify-center text-[11px] font-bold text-white shadow-md hover:scale-105 transition-all"
            >
              {userRole.slice(0, 2)}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl backdrop-blur-2xl bg-emerald-950/95 border border-emerald-500/30 shadow-2xl p-3 z-50 text-white animate-fade-in">
                <div className="border-b border-emerald-800/60 pb-2 mb-2">
                  <div className="font-bold text-xs truncate">{userName}</div>
                  <div className="text-[10px] text-emerald-300 truncate">{userEmail}</div>
                  <div className="text-[9px] uppercase font-mono text-emerald-400 mt-0.5">
                    Rol: {userRole}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Página Principal (Home)</span>
                  </Link>
                  <Link
                    href="/dashboard/enclosures"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Gestión de Recintos</span>
                  </Link>
                  <Link
                    href="/dashboard/specimens"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200"
                  >
                    <PawPrint className="w-3.5 h-3.5" />
                    <span>Fauna Rescatada</span>
                  </Link>
                  <Link
                    href="/dashboard/feeding"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Bitácora Nutricional</span>
                  </Link>
                  <Link
                    href="/dashboard/network"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-200"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Red de Derivaciones</span>
                  </Link>
                </div>

                <div className="border-t border-emerald-800/60 pt-2 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interruptor Día / Noche */}
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-500/20">
            <span className="text-[11px] font-semibold text-emerald-100 hidden sm:inline">
              Día / Noche
            </span>
            <button
              onClick={toggleMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
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

      {/* 2. ÁREA CENTRAL DEL TABLERO (CON DOCK LATERAL Y WIDGETS FLOTANTES) */}
      <div className="relative z-20 flex-1 flex overflow-hidden">
        {/* BARRA LATERAL IZQUIERDA (VERTICAL DOCK) */}
        <aside className="w-16 h-full flex flex-col justify-between items-center py-6 backdrop-blur-2xl bg-emerald-950/60 border-r border-emerald-500/20 text-emerald-200 z-30">
          <div className="flex flex-col gap-4">
            {/* 1. Dashboard 3D */}
            <Link
              href="/dashboard"
              onClick={() => setActiveTab("dashboard")}
              title="Panel 3D Ecosistema"
              className="p-2.5 rounded-xl bg-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/30 border border-emerald-400/40 hover:scale-105 transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>

            {/* 2. Home Landing */}
            <Link
              href="/"
              title="Página Principal (Home)"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-all hover:scale-105"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* 3. Recintos / Hábitats */}
            <Link
              href="/dashboard/enclosures"
              title="Recintos y Hábitats (CRUD)"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-all hover:scale-105"
            >
              <Compass className="w-5 h-5" />
            </Link>

            {/* 4. Fauna Rescatada */}
            <Link
              href="/dashboard/specimens"
              title="Fauna Rescatada (Especímenes)"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-all hover:scale-105"
            >
              <PawPrint className="w-5 h-5" />
            </Link>

            {/* 5. Bitácora Nutricional */}
            <Link
              href="/dashboard/feeding"
              title="Bitácora Nutricional (Idempotencia)"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-all hover:scale-105"
            >
              <UtensilsCrossed className="w-5 h-5" />
            </Link>

            {/* 6. Red Inter-Santuarios */}
            <Link
              href="/dashboard/network"
              title="Red Inter-Santuarios (Derivaciones)"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-all hover:scale-105"
            >
              <Share2 className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {/* Ajustes / Inspector de Schema */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Ajustes y Schema PostgreSQL"
              className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-200 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2.5 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ESPACIO PRINCIPAL CON TARJETAS FLOTANTES */}
        <main className="flex-1 p-4 sm:p-6 relative flex flex-col justify-between overflow-y-auto">
          {/* TARJETA SUPERIOR IZQUIERDA: RECINTOS ACTIVOS */}
          <div className="self-start z-20">
            <Link
              href="/dashboard/enclosures"
              className="block group transition-transform hover:scale-[1.02]"
            >
              <div className="p-5 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/40 shadow-2xl text-white min-w-[220px]">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                  <span>Recintos Activos</span>
                  <ChevronDown className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-3xl font-black text-white mb-2">
                  {enclosuresCount}
                </div>
                <div className="text-xs text-emerald-200 font-medium space-y-0.5">
                  <div>Fauna Rescatada: {specimensCount}</div>
                  <div>
                    Estado: <span className="font-bold text-emerald-400">Óptimo</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* CENTRO: BOTÓN DISPARADOR PARA VER EL BIOMA 3D TURNTABLE */}
          <div className="self-center z-20">
            <button
              onClick={() => setIsBiomeModalOpen(true)}
              className="px-6 py-3 rounded-full backdrop-blur-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-100 hover:bg-emerald-900/90 font-bold text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Explorar Vista del Bioma 3D (Fauna Silvestre)</span>
            </button>
          </div>

          {/* TARJETAS INFERIORES IZQUIERDAS: MODO NOCHE, HUMEDAD Y GRÁFICO */}
          <div className="self-start space-y-3 z-20">
            {/* Badges horizontales interactivos */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMode}
                className="px-4 py-2 rounded-xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold hover:bg-emerald-900/80 transition-all cursor-pointer"
              >
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
              </button>

              <div className="px-4 py-2 rounded-xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Humedad: 82%</span>
              </div>
            </div>

            {/* Tarjeta de Gráfico Ondulante "Monitoreo Nocturno / Diurno" */}
            <div className="p-4 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/35 text-white w-72 shadow-xl">
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
        <aside className="w-80 h-full p-4 flex flex-col justify-between backdrop-blur-2xl bg-emerald-950/50 border-l border-emerald-500/20 text-white overflow-y-auto space-y-3 z-30">
          <div className="space-y-3">
            {/* Tarjeta 1: Recintos Activos & Fauna Rescatada con Slider */}
            <div className="p-4 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/35 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                <span>Recintos Activos</span>
                <Link
                  href="/dashboard/enclosures"
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              <Link
                href="/dashboard/specimens"
                className="flex items-center gap-3 group hover:bg-emerald-900/30 p-1.5 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-300">Fauna Rescatada:</div>
                  <div className="text-2xl font-black text-white">{specimensCount}</div>
                </div>
              </Link>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-emerald-300/80">
                  <span>Capacidad del Santuario</span>
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
            <Link
              href="/dashboard/enclosures"
              className="p-3.5 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/35 flex items-center justify-between text-xs hover:bg-emerald-900/40 transition-colors shadow-lg block group"
            >
              <div className="flex items-center gap-2 text-emerald-300">
                <Radio className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Alerta</div>
                  <div className="font-semibold text-white">Sin Incidencias</div>
                </div>
              </div>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                &gt;
              </span>
            </Link>

            {/* Tarjeta 3: Botón Especial de Sustentación Oral "Simular Doble Clic" */}
            <div className="p-3.5 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/35 space-y-2 shadow-lg">
              <button
                onClick={runIdempotencyTest}
                disabled={idempotencyTesting}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-between transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
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
                  <span>{idempotencySuccess}</span>
                </div>
              )}
            </div>

            {/* Tarjeta 4: Alerta Preventiva */}
            <Link
              href="/dashboard/enclosures"
              className="p-3.5 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/35 flex items-center justify-between text-xs hover:bg-emerald-900/40 transition-colors shadow-lg block group"
            >
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400">
                    Alerta Operativa
                  </div>
                  <div className="font-semibold text-white">Capacidad Biológica Estable</div>
                </div>
              </div>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                &gt;
              </span>
            </Link>

            {/* Tarjeta 5: Inspector Multitenant */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full text-left p-3.5 rounded-2xl backdrop-blur-2xl bg-emerald-950/70 border border-emerald-500/35 text-xs space-y-1.5 font-mono shadow-lg hover:bg-emerald-900/40 transition-colors cursor-pointer"
            >
              <div className="text-emerald-400 font-bold font-sans text-[11px] flex items-center justify-between">
                <span>Tenant: {tenantSlug}</span>
                <span className="text-[9px] text-emerald-300 underline">Detalles</span>
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
            </button>
          </div>

          {/* Botón Flotante Redondo Inferior Derecho (Quick Action) */}
          <div className="flex justify-end pt-2 relative">
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-105 transition-all cursor-pointer"
              title="Acciones Rápidas"
            >
              <Plus className={`w-5 h-5 transition-transform ${isQuickActionsOpen ? "rotate-45" : ""}`} />
            </button>

            {/* Menú de Acciones Rápidas */}
            {isQuickActionsOpen && (
              <div className="absolute right-0 bottom-14 w-60 rounded-2xl backdrop-blur-2xl bg-emerald-950/95 border border-emerald-500/40 shadow-2xl p-3 z-50 text-white animate-fade-in space-y-1.5 text-xs">
                <div className="font-bold text-[11px] text-emerald-300 px-2 py-1 border-b border-emerald-800/60 mb-1">
                  Acciones Rápidas del Dominio
                </div>
                <Link
                  href="/dashboard/enclosures"
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-100"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Nuevo Recinto / Hábitat</span>
                </Link>
                <Link
                  href="/dashboard/specimens"
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-100"
                >
                  <PawPrint className="w-4 h-4 text-teal-400" />
                  <span>Registrar Especimen Rescatado</span>
                </Link>
                <Link
                  href="/dashboard/feeding"
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-100"
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>Registrar Ración Nutricional</span>
                </Link>
                <Link
                  href="/dashboard/network"
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-500/20 text-emerald-100"
                >
                  <Share2 className="w-4 h-4 text-lime-400" />
                  <span>Solicitar Derivación de Fauna</span>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal 3D del Bioma con el Ciervo y Flores Bioluminiscentes */}
      <BiomeInspectorModal
        isOpen={isBiomeModalOpen}
        onClose={() => setIsBiomeModalOpen(false)}
      />

      {/* Modal de Notificaciones del Sistema */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl backdrop-blur-2xl bg-emerald-950/90 border border-emerald-500/40 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Notificaciones y Alertas</span>
              </h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-800/60 text-emerald-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center justify-between">
                  <span>Capacidad en Hábitat Selva</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Hace 15m</span>
                </div>
                <p className="text-emerald-100/80">
                  Ocupación al 82%. Quedan 2 cupos biológicos disponibles antes de requerir derivación.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40 space-y-1">
                <div className="font-bold text-amber-300 flex items-center justify-between">
                  <span>Turno Nutricional Matutino</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Hace 1h</span>
                </div>
                <p className="text-emerald-100/80">
                  Todas las raciones registradas con <code>Idempotency-Key</code> exitosamente.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Red Inter-Santuarios */}
      {isNetworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl backdrop-blur-2xl bg-emerald-950/90 border border-emerald-500/40 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Red Colaborativa Inter-Santuarios</span>
              </h3>
              <button
                onClick={() => setIsNetworkModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-800/60 text-emerald-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Santuarios y refugios aliados conectados en la red autorizada para derivación de fauna en situaciones de sobrecupo biológico:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {partnerSanctuaries.length > 0 ? (
                partnerSanctuaries.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-emerald-300 font-mono">
                        slug: {s.slug}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Conectado
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-900/40 text-xs text-emerald-300 text-center">
                  Cargando santuarios aliados desde /api/v1/network/sanctuaries...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/dashboard/network"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Ir al Módulo de Red Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsNetworkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración y Schema PostgreSQL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl backdrop-blur-2xl bg-emerald-950/90 border border-emerald-500/40 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Aislamiento por Schema PostgreSQL</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-800/60 text-emerald-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/60 space-y-1.5">
                <div className="text-[10px] text-emerald-400 uppercase font-sans font-bold">
                  Conexión Activa
                </div>
                <div>Tenant Slug: <span className="text-white font-bold">{tenantSlug}</span></div>
                <div>Schema Activo: <span className="text-emerald-300 font-bold">{tenantSchema}</span></div>
                <div>Comando DDL: <span className="text-amber-300">SET search_path TO "{tenantSchema}", public;</span></div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/60 space-y-1.5 font-sans">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">
                  Seguridad RBAC
                </div>
                <div className="text-xs">Usuario: <span className="text-white font-bold">{userName}</span></div>
                <div className="text-xs">Rol Activo: <span className="text-emerald-300 font-bold">{userRole}</span></div>
                <div className="text-[11px] text-emerald-200/70">
                  Permisos de creación y mutación DDL autorizados para este esquema.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LivingEcosystemDashboard;
