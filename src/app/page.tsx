"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Compass,
  Trees,
  ArrowRight,
  HeartHandshake,
  PawPrint,
  UtensilsCrossed,
  Share2,
  LogIn,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { DayNightSwitch } from "@/components/ui/DayNightSwitch";

export default function LandingHomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Fondo 3D Interactivo con Ciclo Solar/Lunar y Río Especular */}
      <DynamicLivingSanctuary />

      {/* 1. NAVBAR SUPERIOR FLOTANTE */}
      <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <nav className="flex items-center justify-between px-6 py-3.5 rounded-2xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/50 border border-emerald-600/25 dark:border-emerald-400/25 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 transition-all duration-500">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Trees className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 dark:from-emerald-300 dark:via-teal-200 dark:to-emerald-400 bg-clip-text text-transparent">
                BioSanctuary
              </span>
              <span className="ml-1 text-xs uppercase px-1.5 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                OS
              </span>
            </div>
          </Link>

          {/* Botones de Navegación del Navbar */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <DayNightSwitch />

            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Panel 3D</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-emerald-500/15 transition-colors border border-emerald-600/15 dark:border-emerald-400/20"
            >
              <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Iniciar Sesión</span>
            </Link>

            <Link
              href="/register"
              className="text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <span>Registrar Santuario</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. HERO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center items-center text-center z-10">
        {/* Contenedor Glassmorphism Principal del Hero para Máxima Legibilidad y Elegancia */}
        <div className="w-full max-w-4xl p-8 sm:p-12 rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-emerald-950/70 border border-emerald-600/25 dark:border-emerald-400/25 shadow-2xl shadow-emerald-950/10 dark:shadow-black/50 mb-10 flex flex-col items-center">
          {/* Badge de Aislamiento de Schema */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 mb-6 backdrop-blur-md shadow-sm">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Arquitectura Schema-per-Tenant Estricta &amp; Ecosistema 3D Vivo</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl leading-[1.1] mb-6">
            <span className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-teal-200 bg-clip-text text-transparent">
              Gestión Inteligente de
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent">
              Fauna y Hábitats Silvestres
            </span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl text-emerald-900/80 dark:text-emerald-100/80 mb-8 leading-relaxed font-normal">
            Plataforma SaaS para refugios y reservas biológicas. Aislamiento criptográfico por esquema PostgreSQL dedicado,
            visores 3D procedimentales y red colaborativa inter-santuarios con ciclo solar y lunar en vivo.
          </p>

          {/* Botones de Acción Principales */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Aprovisionar mi Santuario</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-emerald-900/60 border border-emerald-600/30 dark:border-emerald-400/30 text-emerald-950 dark:text-emerald-100 font-extrabold text-base hover:bg-white dark:hover:bg-emerald-900/80 shadow-lg shadow-emerald-950/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Acceder al Panel 3D en Vivo</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl backdrop-blur-xl bg-emerald-900/10 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 text-emerald-900 dark:text-emerald-200 font-bold text-base hover:bg-emerald-500/15 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>

        {/* 3. MÓDULOS DEL DOMINIO CON ENLACES DIRECTOS A LOS ENDPOINTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full text-left">
          {/* Módulo 1: Recintos y Hábitats */}
          <Link
            href="/dashboard/enclosures"
            className="group p-6 rounded-2xl backdrop-blur-xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/25 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1.5 hover:border-emerald-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mb-4 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2 flex items-center justify-between">
                <span>Recintos y Hábitats</span>
                <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed mb-4">
                Listado y creación sobre <code>/api/v1/enclosures</code> con cálculo en vivo de ocupación, biomas y bloqueo de mantenimiento con animales residentes.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GET / POST / PATCH</span>
            </div>
          </Link>

          {/* Módulo 2: Fauna Rescatada */}
          <Link
            href="/dashboard/specimens"
            className="group p-6 rounded-2xl backdrop-blur-xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/25 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1.5 hover:border-emerald-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-500/20 dark:bg-teal-400/10 flex items-center justify-center text-teal-700 dark:text-teal-300 mb-4 border border-teal-500/30 group-hover:scale-110 transition-transform">
                <PawPrint className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2 flex items-center justify-between">
                <span>Fauna Rescatada</span>
                <ArrowRight className="w-4 h-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed mb-4">
                Gestión de especímenes sobre <code>/api/v1/specimens</code> con validación biológica de cupo, microchips RFID únicos y vinculación a recintos.
              </p>
            </div>
            <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GET / POST</span>
            </div>
          </Link>

          {/* Módulo 3: Bitácora Nutricional & Idempotencia */}
          <Link
            href="/dashboard/feeding"
            className="group p-6 rounded-2xl backdrop-blur-xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/25 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1.5 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 dark:bg-amber-400/10 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2 flex items-center justify-between">
                <span>Bitácora Nutricional</span>
                <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed mb-4">
                Registro de dietas sobre <code>/api/v1/feeding-logs</code> blindado con cabecera <code>Idempotency-Key</code> para evitar duplicación de raciones.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Idempotency-Key UUID</span>
            </div>
          </Link>

          {/* Módulo 4: Red Inter-Santuarios */}
          <Link
            href="/dashboard/network"
            className="group p-6 rounded-2xl backdrop-blur-xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/25 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1.5 hover:border-lime-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-lime-500/20 dark:bg-lime-400/10 flex items-center justify-center text-lime-700 dark:text-lime-300 mb-4 border border-lime-500/30 group-hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2 flex items-center justify-between">
                <span>Red Inter-Santuarios</span>
                <ArrowRight className="w-4 h-4 text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed mb-4">
                Red colaborativa en <code>/api/v1/network/transfers</code> y <code>sanctuaries</code> para derivación de fauna en sobrecupo entre reservas aliadas.
              </p>
            </div>
            <div className="text-[11px] font-mono text-lime-600 dark:text-lime-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Red Multitenant</span>
            </div>
          </Link>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="z-10 py-6 px-4 text-center text-xs text-emerald-900/70 dark:text-emerald-300/70 border-t border-emerald-600/15 dark:border-emerald-400/15 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            BioSanctuary OS &copy; {new Date().getFullYear()} — Plataforma de Conservación y Bienestar de Fauna Silvestre.
          </p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/login" className="hover:text-emerald-400 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="hover:text-emerald-400 transition-colors">
              Registrar Santuario
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
              Panel 3D
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
