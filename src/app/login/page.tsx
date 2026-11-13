"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trees, Lock, Mail, AlertTriangle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { DayNightSwitch } from "@/components/ui/DayNightSwitch";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado para Rate Limiting 429 con cuenta regresiva en vivo
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (rateLimitSeconds === null || rateLimitSeconds <= 0) return;

    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitSeconds && rateLimitSeconds > 0) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Captura especial de Rate Limiting
        const seconds = data.retryAfterSeconds || 30;
        setRateLimitSeconds(seconds);
        setErrorMessage(data.error || "Límite de intentos de inicio de sesión excedido.");
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Credenciales incorrectas o usuario no autorizado.");
        return;
      }

      // Éxito: la cookie httpOnly ya fue inyectada por el endpoint
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Error de conexión con el servidor. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden overflow-y-auto">
      <DynamicLivingSanctuary />

      {/* Top Bar */}
      <header className="z-20 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Trees className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
            BioSanctuary OS
          </span>
        </Link>
        <DayNightSwitch />
      </header>

      {/* Main Login Card */}
      <main className="z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md p-8 sm:p-10 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-2xl shadow-emerald-950/15 dark:shadow-black/60 text-emerald-950 dark:text-emerald-50 transition-colors"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-emerald-900 to-teal-800 dark:from-emerald-200 dark:to-teal-100 bg-clip-text text-transparent">
              Acceso al Santuario
            </h1>
            <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70">
              Ingresa con tus credenciales de reserva biológica autorizada
            </p>
          </div>

          {/* Banner de Rate Limiting 429 con cuenta regresiva en vivo */}
          {rateLimitSeconds !== null && rateLimitSeconds > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 backdrop-blur-md"
            >
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs">
                <p className="font-bold mb-1">Control de Tráfico Activado (HTTP 429)</p>
                <p className="text-amber-800/90 dark:text-amber-300/90 mb-1">
                  Demasiados intentos desde esta IP. Por favor espera a que se desbloquee la ventana:
                </p>
                <div className="text-sm font-mono font-extrabold text-amber-700 dark:text-amber-300">
                  Desbloqueo en: {rateLimitSeconds} segundos
                </div>
              </div>
            </motion.div>
          )}

          {/* Banner de Error Estándar */}
          {errorMessage && rateLimitSeconds === null && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-900 dark:text-red-200 text-xs flex items-center gap-2.5 backdrop-blur-md"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900/80 dark:text-emerald-200/80 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@amazonia.org"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 dark:bg-emerald-950/60 border border-emerald-600/20 dark:border-emerald-400/20 text-emerald-950 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-emerald-900/40 dark:placeholder:text-emerald-300/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900/80 dark:text-emerald-200/80 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 dark:bg-emerald-950/60 border border-emerald-600/20 dark:border-emerald-400/20 text-emerald-950 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-emerald-900/40 dark:placeholder:text-emerald-300/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (rateLimitSeconds !== null && rateLimitSeconds > 0)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Santuario</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-emerald-600/15 dark:border-emerald-400/15 text-center text-xs text-emerald-900/70 dark:text-emerald-300/70">
            ¿Aún no has registrado tu reserva?{" "}
            <Link
              href="/register"
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Aprovisionar nuevo santuario
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="z-10 py-4 text-center text-xs text-emerald-900/50 dark:text-emerald-300/50">
        Sesión blindada mediante Cookie httpOnly con firma criptográfica JWT.
      </footer>
    </div>
  );
}
