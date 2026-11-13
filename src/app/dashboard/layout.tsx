"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trees,
  LayoutDashboard,
  Compass,
  PawPrint,
  UtensilsCrossed,
  Share2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { DayNightSwitch } from "@/components/ui/DayNightSwitch";
import { TenantInspector } from "@/components/dashboard/TenantInspector";

const navigationItems = [
  { name: "Vista General", href: "/dashboard", icon: LayoutDashboard },
  { name: "Recintos y Hábitats", href: "/dashboard/enclosures", icon: Compass },
  { name: "Fauna Rescatada", href: "/dashboard/specimens", icon: PawPrint },
  { name: "Bitácora Nutricional", href: "/dashboard/feeding", icon: UtensilsCrossed },
  { name: "Red Inter-Santuarios", href: "/dashboard/network", icon: Share2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceder con la redirección
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Fondo 3D Atmosférico */}
      <DynamicLivingSanctuary />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 p-5 z-30 backdrop-blur-2xl bg-white/70 dark:bg-emerald-950/40 border-r border-emerald-600/20 dark:border-emerald-400/20 shadow-2xl shadow-emerald-950/10 dark:shadow-black/50 transition-colors">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Trees className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
                BioSanctuary
              </span>
              <span className="ml-1 text-[10px] uppercase px-1 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
          </Link>

          {/* Menú de Navegación */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                      : "text-emerald-950/80 dark:text-emerald-100/80 hover:bg-emerald-500/15 hover:text-emerald-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Botón de Logout en Sidebar */}
        <div className="pt-6 border-t border-emerald-600/15 dark:border-emerald-400/15">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-red-700 dark:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
          </button>
        </div>
      </aside>

      {/* Top Header para Mobile y Controles Globales */}
      <div className="flex-1 flex flex-col min-h-screen z-20 overflow-y-auto">
        <header className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-white/60 dark:bg-emerald-950/40 border-b border-emerald-600/15 dark:border-emerald-400/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-emerald-500/15"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <TenantInspector />
          </div>

          <div className="flex items-center gap-3">
            <DayNightSwitch />
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-emerald-900 dark:text-emerald-100 hover:bg-red-500/15 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-white/95 dark:bg-emerald-950/95 border-b border-emerald-600/20 backdrop-blur-xl space-y-2 z-40">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${
                    isActive
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-emerald-950 dark:text-emerald-100 hover:bg-emerald-500/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Contenido de la Página */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
