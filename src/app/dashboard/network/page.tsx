"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Building,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Shield,
  X,
} from "lucide-react";

interface SanctuaryItem {
  id: string;
  slug: string;
  name: string;
  allow_network_collaboration: boolean;
}

interface TransferItem {
  id: string;
  from_tenant_id: string;
  to_tenant_id: string;
  species_name: string;
  urgency: "STANDARD" | "HIGH" | "CRITICAL";
  reason: string;
  status: string;
  created_at: string;
  from_sanctuary_name: string;
  from_sanctuary_slug: string;
  to_sanctuary_name: string;
  to_sanctuary_slug: string;
  direction: "INCOMING" | "OUTGOING";
}

export default function NetworkPage() {
  const [sanctuaries, setSanctuaries] = useState<SanctuaryItem[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal para nueva solicitud de traslado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [targetTenantId, setTargetTenantId] = useState("");
  const [speciesName, setSpeciesName] = useState("");
  const [urgency, setUrgency] = useState<"STANDARD" | "HIGH" | "CRITICAL">("STANDARD");
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSanc, resTrans] = await Promise.all([
        fetch("/api/v1/network/sanctuaries"),
        fetch("/api/v1/network/transfers"),
      ]);

      if (resSanc.ok) {
        const dataSanc = await resSanc.json();
        const list = dataSanc.data || [];
        setSanctuaries(list);
        if (list.length > 0 && !targetTenantId) {
          setTargetTenantId(list[0].id);
        }
      }

      if (resTrans.ok) {
        const dataTrans = await resTrans.json();
        setTransfers(dataTrans.data || []);
      }
    } catch {
      setErrorBanner("Error al obtener los datos de la red inter-santuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const res = await fetch("/api/v1/network/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_tenant_id: targetTenantId,
          species_name: speciesName,
          urgency,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorBanner(data.error || "Error al crear la solicitud de derivación.");
        return;
      }

      setSuccessBanner("Solicitud de derivación inter-santuario emitida exitosamente.");
      setIsModalOpen(false);
      setSpeciesName("");
      setReason("");
      await fetchData();
    } catch {
      setErrorBanner("Error de comunicación al emitir la solicitud de derivación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white flex items-center gap-2.5">
            <Share2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Red de Cooperación Inter-Santuarios</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 mt-1">
            Derivación colaborativa de fauna por sobrecupo o atención veterinaria especializada
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Derivación</span>
        </button>
      </div>

      {/* Alertas */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-900 dark:text-red-200 text-xs flex items-center gap-3 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span className="font-semibold">{errorBanner}</span>
        </div>
      )}

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{successBanner}</span>
        </div>
      )}

      {/* Directorio de Santuarios Aliados */}
      <div className="p-6 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 dark:text-white">
          <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Santuarios Aliados con Red Habilitada (allow_network_collaboration = true)</span>
        </div>

        {sanctuaries.length === 0 ? (
          <p className="text-xs text-emerald-900/60 dark:text-emerald-300/60">
            No hay otros santuarios aliados registrados en la red pública por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sanctuaries.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-950 dark:text-white block">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-emerald-800/70 dark:text-emerald-400/70 font-mono">
                    slug: {s.slug}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  <span>Aliado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listado de Solicitudes de Traslado */}
      <div className="p-6 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 dark:text-white">
            <ArrowRightLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Historial de Derivaciones Entrantes y Salientes</span>
          </div>
          <span className="text-xs text-emerald-900/60 dark:text-emerald-300/60 font-mono">
            {transfers.length} solicitudes registradas
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Consultando solicitudes inter-santuario...</span>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-10 text-emerald-900/60 dark:text-emerald-300/60 text-xs">
            No hay solicitudes de derivación activas para este santuario.
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white/60 dark:bg-emerald-950/60 border border-emerald-600/20 dark:border-emerald-400/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {t.direction === "OUTGOING" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>SALIENTE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-800 dark:text-sky-300">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>ENTRANTE</span>
                      </span>
                    )}

                    <span className="font-extrabold text-sm text-emerald-950 dark:text-white">
                      {t.species_name}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.urgency === "CRITICAL"
                          ? "bg-red-500 text-white"
                          : t.urgency === "HIGH"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {t.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-950/80 dark:text-emerald-100/80">
                    {t.reason}
                  </p>

                  <div className="text-[11px] text-emerald-900/60 dark:text-emerald-300/60 flex items-center gap-2">
                    <span>
                      De: <strong>{t.from_sanctuary_name}</strong>
                    </span>
                    <span>&rarr;</span>
                    <span>
                      Hacia: <strong>{t.to_sanctuary_name}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold self-start">
                    {t.status}
                  </span>
                  <span className="text-emerald-900/60 dark:text-emerald-300/60 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(t.created_at).toLocaleDateString("es-ES")}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Crear Solicitud de Derivación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-600/30 shadow-2xl space-y-5 text-emerald-950 dark:text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Solicitar Derivación de Fauna</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Santuario Receptor Aliado</label>
                <select
                  required
                  value={targetTenantId}
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {sanctuaries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Especie a Derivar</label>
                <input
                  type="text"
                  required
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  placeholder="Ocelote (Leopardus pardalis)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Nivel de Urgencia</label>
                <select
                  value={urgency}
                  onChange={(e) =>
                    setUrgency(e.target.value as "STANDARD" | "HIGH" | "CRITICAL")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="STANDARD">STANDARD (Planificación regular de traslado)</option>
                  <option value="HIGH">HIGH (Sobrecupo inminente en hábitat)</option>
                  <option value="CRITICAL">CRITICAL (Atención médica de urgencia / cuarentena requerida)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Motivo / Justificación Biológica</label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Capacidad máxima alcanzada en el recinto de felinos. Se requiere derivación a reserva con bioma compatible."
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-emerald-800 dark:text-emerald-200 font-semibold hover:bg-emerald-500/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Enviar Solicitud</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
