"use client";

import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Plus,
  Filter,
  User,
  Clock,
  Scale,
  FileText,
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
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { useCountdown } from "@/hooks/useCountdown";
import { FeedingLog, FeedingDietType } from "@/types";
import { FEEDING_DIET_LABELS } from "@/lib/labels";
import { apiFetch, RateLimitError } from "@/lib/api/client";

interface SpecimenOption {
  id: string;
  common_name: string;
}

export default function FeedingPage() {
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [specimens, setSpecimens] = useState<SpecimenOption[]>([]);
  const [selectedSpecimenFilter, setSelectedSpecimenFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Rate Limiting 429 State
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const { seconds, isCounting, reset } = useCountdown(rateLimitSeconds, () => {
    setRateLimitSeconds(null);
  });

  // Modal para registro de alimentación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Idempotency Key Hook
  const { key: idempotencyKey, regenerateKey } = useIdempotencyKey();

  // Form Fields
  const [specimenId, setSpecimenId] = useState("");
  const [dietType, setDietType] = useState<FeedingDietType>("REGULAR_FEEDING");
  const [portionGrams, setPortionGrams] = useState<number>(350);
  const [dietNotes, setDietNotes] = useState("");

  const fetchLogs = async (specId?: string) => {
    try {
      const url = specId
        ? `/api/v1/feeding-logs?specimenId=${specId}`
        : "/api/v1/feeding-logs";
      const res = await apiFetch<{ data: FeedingLog[] }>(url);
      setLogs(res.data || []);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al obtener la bitácora de alimentación.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecimens = async () => {
    try {
      const res = await apiFetch<{ data: { id: string; common_name: string }[] }>("/api/v1/specimens");
      const list = (res.data || []).map((s) => ({
        id: s.id,
        common_name: s.common_name,
      }));
      setSpecimens(list);
      if (list.length > 0 && !specimenId) {
        setSpecimenId(list[0].id);
      }
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchSpecimens();
  }, []);

  const openLogModal = () => {
    regenerateKey();
    setErrorBanner(null);
    setSuccessBanner(null);
    setIsModalOpen(true);
  };

  const handleFilterChange = (val: string) => {
    setSelectedSpecimenFilter(val);
    fetchLogs(val || undefined);
  };

  const handleCreateFeedingLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portionGrams <= 0) {
      setErrorBanner("La porción debe ser estrictamente mayor a 0 gramos.");
      return;
    }

    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await apiFetch("/api/v1/feeding-logs", {
        method: "POST",
        idempotencyKey,
        body: JSON.stringify({
          specimen_id: specimenId,
          diet_type: dietType,
          portion_grams: Number(portionGrams),
          diet_notes: dietNotes.trim() || undefined,
        }),
      });

      setSuccessBanner("Registro de alimentación guardado exitosamente con protección de idempotencia.");
      setIsModalOpen(false);
      setDietNotes("");
      regenerateKey();
      await fetchLogs(selectedSpecimenFilter || undefined);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al registrar la alimentación.");
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
            <UtensilsCrossed className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Bitácora Nutricional y Clínica</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 mt-1">
            Control de dietas, medicación y porciones registradas por cuidadores
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openLogModal}
          iconLeft={<Plus className="w-4 h-4" />}
        >
          Registrar Ingesta
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

      {/* Barra de Filtro por Espécimen */}
      <div className="flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 text-xs">
        <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <label htmlFor="feed-filter" className="font-bold text-emerald-900 dark:text-emerald-200">
          Filtrar por animal:
        </label>
        <select
          id="feed-filter"
          value={selectedSpecimenFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-xs font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="" className="bg-emerald-950 text-white">
            Todos los especímenes
          </option>
          {specimens.map((s) => (
            <option key={s.id} value={s.id} className="bg-emerald-950 text-white">
              {s.common_name}
            </option>
          ))}
        </select>
      </div>

      {/* Listado de Registros de Alimentación */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
          <Spinner size="md" />
          <span>Cargando bitácora de alimentación…</span>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-8 h-8" />}
          title="Sin registros de alimentación"
          description="Aún no se han registrado raciones o tratamientos nutricionales para los animales seleccionados."
          action={
            <Button variant="primary" onClick={openLogModal}>
              Registrar Primera Ingesta
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 space-y-4 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-emerald-950 dark:text-white">
                    {log.specimen_name || "Espécimen"}
                  </h2>
                  <span className="text-[11px] text-emerald-900/60 dark:text-emerald-300/60 font-mono">
                    ID: {log.id.slice(0, 8)}…
                  </span>
                </div>
                <StatusPill kind={{ type: "diet", status: log.diet_type }} />
              </div>

              <div className="space-y-2 text-xs border-t border-b border-emerald-600/10 dark:border-emerald-400/15 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Porción Suministrada:</span>
                  </span>
                  <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-200">
                    {log.portion_grams} g
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Cuidador Responsable:</span>
                  </span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                    {log.keeper_name || "Cuidador de guardia"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Fecha y Hora:</span>
                  </span>
                  <span className="text-emerald-900/80 dark:text-emerald-200/80">
                    {new Date(log.created_at || log.logged_at || 0).toLocaleString("es-ES")}
                  </span>
                </div>
              </div>

              {log.diet_notes && (
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/5 text-xs text-emerald-900/80 dark:text-emerald-200/80 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="italic">&ldquo;{log.diet_notes}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Registrar Alimentación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Ingesta / Tratamiento Nutricional"
      >
        <form onSubmit={handleCreateFeedingLog} className="space-y-4">
          <Select
            label="Espécimen Receptor"
            id="feed-specimen"
            required
            value={specimenId}
            onChange={(e) => setSpecimenId(e.target.value)}
            options={specimens.map((s) => ({ value: s.id, label: s.common_name }))}
          />

          <Select
            label="Tipo de Dieta o Régimen"
            id="feed-diet-type"
            required
            value={dietType}
            onChange={(e) => setDietType(e.target.value as FeedingDietType)}
            options={[
              { value: "REGULAR_FEEDING", label: FEEDING_DIET_LABELS.REGULAR_FEEDING },
              { value: "MEDICAL_TREATMENT", label: FEEDING_DIET_LABELS.MEDICAL_TREATMENT },
              { value: "EMERGENCY_SUPPLEMENT", label: FEEDING_DIET_LABELS.EMERGENCY_SUPPLEMENT },
            ]}
          />

          <div>
            <label
              htmlFor="feed-portion"
              className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-100 mb-1.5"
            >
              Porción en Gramos (g) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="feed-portion"
                type="number"
                min="1"
                required
                value={portionGrams}
                onChange={(e) => setPortionGrams(Number(e.target.value))}
                className="w-full pl-3.5 pr-12 py-2.5 rounded-xl text-sm border border-emerald-600/25 dark:border-emerald-400/25 bg-white/70 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-emerald-600 dark:text-emerald-400 pointer-events-none">
                g
              </span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-900/60 dark:text-emerald-300/60">
              La cantidad debe ser estrictamente mayor a 0 gramos.
            </p>
          </div>

          <Textarea
            label="Observaciones y Medicación"
            id="feed-notes"
            optional
            value={dietNotes}
            onChange={(e) => setDietNotes(e.target.value)}
            placeholder="Ej: Ingesta completa con suplemento vitamínico administrado."
            hint="Detalles clínicos relevantes para el equipo veterinario."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-600/15 dark:border-emerald-400/15">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Guardar en Bitácora
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
