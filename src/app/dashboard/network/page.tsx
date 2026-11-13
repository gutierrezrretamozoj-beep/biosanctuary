"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Building,
  Plus,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
} from "lucide-react";
import {
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  Banner,
  StatusPill,
  EmptyState,
  Spinner,
} from "@/components/ui";
import { RateLimitBanner } from "@/components/feedback";
import { useCountdown } from "@/hooks/useCountdown";
import { Sanctuary, TransferRequest, UrgencyLevel } from "@/types";
import { URGENCY_LABELS } from "@/lib/labels";
import { apiFetch, RateLimitError } from "@/lib/api/client";

export default function NetworkPage() {
  const [sanctuaries, setSanctuaries] = useState<Sanctuary[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Rate Limiting 429 State
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const { seconds, isCounting, reset } = useCountdown(rateLimitSeconds, () => {
    setRateLimitSeconds(null);
  });

  // Modal para nueva solicitud de traslado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [targetTenantId, setTargetTenantId] = useState("");
  const [speciesName, setSpeciesName] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("STANDARD");
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    try {
      const [resSanc, resTrans] = await Promise.all([
        apiFetch<{ data: Sanctuary[] }>("/api/v1/network/sanctuaries"),
        apiFetch<{ data: TransferRequest[] }>("/api/v1/network/transfers"),
      ]);

      const sancList = resSanc.data || [];
      setSanctuaries(sancList);
      if (sancList.length > 0 && !targetTenantId) {
        setTargetTenantId(sancList[0].id);
      }

      setTransfers(resTrans.data || []);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al obtener los datos de la red inter-santuarios.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openTransferModal = () => {
    setErrorBanner(null);
    setSuccessBanner(null);
    setIsModalOpen(true);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await apiFetch("/api/v1/network/transfers", {
        method: "POST",
        body: JSON.stringify({
          to_tenant_id: targetTenantId,
          species_name: speciesName,
          urgency,
          reason,
        }),
      });

      setSuccessBanner("Solicitud de derivación inter-santuario emitida exitosamente.");
      setIsModalOpen(false);
      setSpeciesName("");
      setReason("");
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al crear la solicitud de derivación.");
      }
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

        <Button
          variant="primary"
          onClick={openTransferModal}
          iconLeft={<Plus className="w-4 h-4" />}
        >
          Solicitar Derivación
        </Button>
      </div>

      {isCounting && seconds !== null && (
        <RateLimitBanner
          seconds={seconds}
          onFinished={() => setRateLimitSeconds(null)}
        />
      )}

      {errorBanner && (
        <Banner
          type="error"
          message={errorBanner}
          onDismiss={() => setErrorBanner(null)}
        />
      )}

      {successBanner && (
        <Banner
          type="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner(null)}
        />
      )}

      {/* Directorio de Santuarios Aliados */}
      <div className="p-6 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 dark:text-white">
          <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Santuarios Aliados con Red Habilitada</span>
        </div>

        {sanctuaries.length === 0 ? (
          <p className="text-xs text-emerald-900/60 dark:text-emerald-300/60">
            No hay otros santuarios aliados registrados en la red colaborativa por el momento.
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
            <Spinner size="md" />
            <span>Consultando solicitudes inter-santuario…</span>
          </div>
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={<ArrowRightLeft className="w-8 h-8" />}
            title="Sin solicitudes de derivación activas"
            description="Actualmente no hay trámites de traslado de fauna emitidos ni recibidos por este santuario."
            action={
              <Button variant="primary" onClick={openTransferModal}>
                Emitir Primera Solicitud
              </Button>
            }
          />
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>SALIENTE (↗)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-800 dark:text-sky-300">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>ENTRANTE (↙)</span>
                      </span>
                    )}

                    <StatusPill kind={{ type: "urgency", status: t.urgency_level }} />
                  </div>

                  <h3 className="text-sm font-bold text-emerald-950 dark:text-white">
                    {t.specimen_name || "Espécimen no especificado"}
                  </h3>
                  <p className="text-xs text-emerald-900/70 dark:text-emerald-300/70">
                    Motivo: {t.reason}
                  </p>
                </div>

                <div className="text-left md:text-right text-xs space-y-1">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                    {t.direction === "OUTGOING"
                      ? `Destino: ${t.target_tenant_name || "Santuario receptor"}`
                      : `Origen: ${t.origin_tenant_name || "Santuario emisor"}`}
                  </p>
                  <p className="text-emerald-900/60 dark:text-emerald-300/60">
                    {new Date(t.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Solicitar Traslado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Emitir Solicitud de Derivación Inter-Santuarios"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <Select
            label="Santuario Receptor Autorizado"
            id="net-target"
            required
            value={targetTenantId}
            onChange={(e) => setTargetTenantId(e.target.value)}
            options={sanctuaries.map((s) => ({ value: s.id, label: s.name }))}
          />

          <Input
            label="Especie / Ejemplar a Derivar"
            id="net-species"
            required
            value={speciesName}
            onChange={(e) => setSpeciesName(e.target.value)}
            placeholder="Jaguar Melánico (Panthera onca)"
          />

          <Select
            label="Nivel de Urgencia Clínica y Operativa"
            id="net-urgency"
            required
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
            options={[
              { value: "STANDARD", label: URGENCY_LABELS.STANDARD },
              { value: "HIGH", label: URGENCY_LABELS.HIGH },
              { value: "CRITICAL", label: `${URGENCY_LABELS.CRITICAL} (Riesgo Vital Inmediato)` },
            ]}
          />

          <Textarea
            label="Justificación de la Derivación"
            id="net-reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Sobrecupo en recinto de felinos / Requiere cirugía especializada..."
            hint="Detalla la condición clínica o de recinto que motiva el traslado."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-600/15 dark:border-emerald-400/15">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Emitir Solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
