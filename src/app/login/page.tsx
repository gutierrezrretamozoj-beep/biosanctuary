"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trees, Lock, Mail, ArrowRight } from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { DayNightSwitch } from "@/components/ui/DayNightSwitch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Banner } from "@/components/ui/Banner";
import { RateLimitBanner } from "@/components/feedback/RateLimitBanner";
import { useCountdown } from "@/hooks/useCountdown";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const { seconds, isCounting, reset } = useCountdown(rateLimitSeconds, () => {
    setRateLimitSeconds(null);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCounting) return;

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
        const retrySec = data.retryAfterSeconds || 30;
        setRateLimitSeconds(retrySec);
        reset(retrySec);
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
      setErrorMessage("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
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
          {isCounting && seconds !== null && (
            <div className="mb-6">
              <RateLimitBanner
                seconds={seconds}
                message="Has excedido el número de intentos permitidos para tu dirección IP."
                onFinished={() => setRateLimitSeconds(null)}
              />
            </div>
          )}

          {/* Banner de Error Estándar */}
          {errorMessage && !isCounting && (
            <div className="mb-6">
              <Banner
                type="error"
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo Electrónico"
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="director@amazonia.org"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Contraseña"
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={isCounting}
              className="w-full py-3.5"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Ingresar al Santuario
            </Button>
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
