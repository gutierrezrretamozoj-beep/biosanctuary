"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trees,
  Shield,
  Building,
  User,
  Mail,
  Lock,
  Globe,
  CheckCircle2,
  ArrowRight,
  Database,
  Share2,
} from "lucide-react";
import { DynamicLivingSanctuary } from "@/components/3d/DynamicLivingSanctuary";
import { DayNightSwitch } from "@/components/ui/DayNightSwitch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Banner } from "@/components/ui/Banner";

export default function RegisterPage() {
  const router = useRouter();

  const [sanctuaryName, setSanctuaryName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allowCollaboration, setAllowCollaboration] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [provisionedData, setProvisionedData] = useState<{
    schemaName: string;
    slug: string;
    name: string;
  } | null>(null);

  // Generación automática de slug a partir del nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSanctuaryName(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sanctuaryName,
          slug,
          adminName,
          email,
          password,
          allowCollaboration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "No se pudo aprovisionar el santuario.");
        setLoading(false);
        return;
      }

      // Éxito: Mostrar confirmación del schema PostgreSQL antes de redirigir
      setProvisionedData({
        schemaName: data.tenant?.schemaName || `tenant_${slug.replace(/-/g, "_")}`,
        slug: data.tenant?.slug || slug,
        name: data.tenant?.name || sanctuaryName,
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2200);
    } catch {
      setErrorMessage("Error de conexión al aprovisionar. Revisa los datos e inténtalo de nuevo.");
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

      {/* Main Register Card */}
      <main className="z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg p-8 sm:p-10 rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-2xl shadow-emerald-950/15 dark:shadow-black/60 text-emerald-950 dark:text-emerald-50 transition-colors"
        >
          {provisionedData ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mb-1">
                  ¡Santuario Aprovisionado con Éxito!
                </h2>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                  {provisionedData.name} está listo para operar
                </p>
              </div>

              {/* Ficha técnica del schema PostgreSQL */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/30 text-left font-mono text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-800 pb-2">
                  <Database className="w-4 h-4" />
                  <span>Aislamiento Criptográfico PostgreSQL</span>
                </div>
                <div>
                  <span className="text-emerald-500">Schema Aislado: </span>
                  <span className="font-bold text-white bg-emerald-900/60 px-1.5 py-0.5 rounded">
                    {provisionedData.schemaName}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-500">Identificador Slug: </span>
                  <span className="text-white">{provisionedData.slug}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Tablas de dominio creadas con SET search_path dinámico</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium pt-2">
                <span>Iniciando sesión segura y redirigiendo al panel de control…</span>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-emerald-900 to-teal-800 dark:from-emerald-200 dark:to-teal-100 bg-clip-text text-transparent">
                  Aprovisionar Nuevo Santuario
                </h1>
                <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70">
                  Crea un tenant independiente con schema PostgreSQL aislado y rol de Director
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5">
                  <Banner
                    type="error"
                    message={errorMessage}
                    onDismiss={() => setErrorMessage(null)}
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre del Santuario / Reserva"
                  id="reg-sanctuary-name"
                  type="text"
                  required
                  value={sanctuaryName}
                  onChange={handleNameChange}
                  placeholder="Santuario Selva Esmeralda"
                  icon={<Building className="w-4 h-4" />}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
                      Identificador Único (Slug) <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      schema: tenant_{slug.replace(/-/g, "_") || "..."}
                    </span>
                  </div>
                  <Input
                    id="reg-slug"
                    type="text"
                    required
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="selva-esmeralda"
                    icon={<Globe className="w-4 h-4" />}
                    className="font-mono"
                  />
                </div>

                <Input
                  label="Nombre Completo del Director / Administrador"
                  id="reg-admin-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Dra. Mariana Cordero"
                  icon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Correo Electrónico Oficial"
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="directora@esmeralda.org"
                  icon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Contraseña Maestra del Santuario"
                  id="reg-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  icon={<Lock className="w-4 h-4" />}
                />

                {/* Switch de Colaboración de Red */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="allowCollaboration"
                    checked={allowCollaboration}
                    onChange={(e) => setAllowCollaboration(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-400 cursor-pointer"
                  />
                  <label
                    htmlFor="allowCollaboration"
                    className="text-xs text-emerald-950 dark:text-emerald-100 cursor-pointer select-none"
                  >
                    <span className="font-bold block mb-0.5 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Habilitar Red Inter-Santuarios
                    </span>
                    Permite que tu santuario coordine traslados y reciba solicitudes de derivación de fauna en situaciones de sobrecupo de reservas aliadas.
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-3.5"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  Aprovisionar Santuario en PostgreSQL
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-emerald-600/15 dark:border-emerald-400/15 text-center text-xs text-emerald-900/70 dark:text-emerald-300/70">
                ¿Ya tienes una reserva aprovisionada?{" "}
                <Link
                  href="/login"
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>

      <footer className="z-10 py-4 text-center text-xs text-emerald-900/50 dark:text-emerald-300/50">
        Aislamiento multi-tenant por schema físico PostgreSQL garantizado mediante pgcrypto.
      </footer>
    </div>
  );
}
