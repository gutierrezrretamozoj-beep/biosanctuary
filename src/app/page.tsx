import React from "react";
import Link from "next/link";
import { Shield, Sparkles, Compass, Trees, ArrowRight, HeartHandshake } from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { DayNightSwitch } from "@/components/ui/DayNightSwitch";

export const dynamic = "force-static";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Fondo 3D Interactivo con Ciclo Solar/Lunar */}
      <DynamicLivingSanctuary />

      {/* Floating Navbar */}
      <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <nav className="flex items-center justify-between px-6 py-3.5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 transition-all duration-500">
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

          <div className="flex items-center gap-3 sm:gap-5">
            <DayNightSwitch />
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-emerald-500/15 transition-colors"
            >
              Iniciar Sesión
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

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 flex flex-col justify-center items-center text-center z-10">
        {/* Badge de Arquitectura Multitenant */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/15 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 mb-6 backdrop-blur-md animate-fade-in">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Arquitectura Schema-per-Tenant Estricta &amp; Ecosistema 3D Vivo</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] mb-6">
          <span className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-teal-200 bg-clip-text text-transparent">
            Gestión Inteligente de
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent">
            Fauna y Hábitats Silvestres
          </span>
        </h1>

        <p className="text-base sm:text-xl max-w-2xl text-emerald-900/80 dark:text-emerald-100/80 mb-10 leading-relaxed font-normal">
          Plataforma SaaS para refugios y reservas biológicas. Aislamiento criptográfico por schema,
          visores 3D procedimentales y red colaborativa inter-santuarios con ciclo solar y lunar en vivo.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Aprovisionar mi Santuario</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/50 border border-emerald-600/25 dark:border-emerald-400/25 text-emerald-950 dark:text-emerald-100 font-bold text-base hover:bg-white/90 dark:hover:bg-emerald-900/60 shadow-lg shadow-emerald-950/5 transition-all"
          >
            Acceder al Panel de Control
          </Link>
        </div>

        {/* Tarjetas de Pilares Arquitectónicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full text-left">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mb-4 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2">
              Aislamiento por Schema
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed">
              Cada reserva opera en un esquema PostgreSQL dedicado (<code>tenant_slug</code>), resolviendo conmutación dinámica con <code>SET search_path</code>.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 dark:bg-teal-400/10 flex items-center justify-center text-teal-700 dark:text-teal-300 mb-4 border border-teal-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2">
              Hábitats 3D Adaptativos
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed">
              Visores interactivos para selva, acuático, sabana, desierto y bosque templado, sincronizados con iluminación solar y lunar.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 dark:bg-amber-400/10 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-4 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2">
              Idempotencia y Rate Limiting
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed">
              Blindaje transaccional con cabecera <code>Idempotency-Key</code> contra dobles clics y algoritmo de ventana deslizante en Redis.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/5 dark:shadow-black/40 hover:-translate-y-1 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-lime-500/20 dark:bg-lime-400/10 flex items-center justify-center text-lime-700 dark:text-lime-300 mb-4 border border-lime-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-white mb-2">
              Red Inter-Santuarios
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-200/70 leading-relaxed">
              Derivación segura de fauna en situaciones de sobrecupo y coordinación entre reservas aliadas autorizadas.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 py-6 px-4 text-center text-xs text-emerald-900/60 dark:text-emerald-300/60 border-t border-emerald-600/10 dark:border-emerald-400/10 backdrop-blur-md">
        <p>
          BioSanctuary OS &copy; {new Date().getFullYear()} — Plataforma de Conservación y Bienestar de Fauna Silvestre.
        </p>
      </footer>
    </div>
  );
}
