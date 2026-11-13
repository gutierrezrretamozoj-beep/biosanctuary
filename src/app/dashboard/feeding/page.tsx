"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  UtensilsCrossed,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Filter,
  User,
  Clock,
  Scale,
  FileText,
  X,
} from "lucide-react";

interface FeedingLogItem {
  id: string;
  specimen_id: string;
  keeper_id: string;
  diet_type: "REGULAR_FEEDING" | "MEDICAL_TREATMENT" | "EMERGENCY_SUPPLEMENT";
  portion_grams: number;
  diet_notes: string | null;
  fed_at: string;
  specimen_common_name: string;
  specimen_scientific_name: string;
  keeper_name: string | null;
  keeper_email: string | null;
  keeper_role: string | null;
}

interface SpecimenOption {
  id: string;
  common_name: string;
}

export default function FeedingPage() {
  const [logs, setLogs] = useState<FeedingLogItem[]>([]);
  const [specimens, setSpecimens] = useState<SpecimenOption[]>([]);
  const [selectedSpecimenFilter, setSelectedSpecimenFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal para registro de alimentación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [specimenId, setSpecimenId] = useState("");
  const [dietType, setDietType] = useState<"REGULAR_FEEDING" | "MEDICAL_TREATMENT" | "EMERGENCY_SUPPLEMENT">("REGULAR_FEEDING");
  const [portionGrams, setPortionGrams] = useState<number>(350);
  const [dietNotes, setDietNotes] = useState("");

  const fetchLogs = async (specId?: string) => {
    setLoading(true);
    try {
      const url = specId
        ? `/api/v1/feeding-logs?specimenId=${specId}`
        : "/api/v1/feeding-logs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch {
      setErrorBanner("Error al obtener la bitácora de alimentación.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecimens = async () => {
    try {
      const res = await fetch("/api/v1/specimens");
      if (res.ok) {
        const data = await res.json();
        const list = (data.data || []).map((s: { id: string; common_name: string }) => ({
          id: s.id,
          common_name: s.common_name,
        }));
        setSpecimens(list);
        if (list.length > 0 && !specimenId) {
          setSpecimenId(list[0].id);
        }
      }
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchSpecimens();
  }, []);

  const handleFilterChange = (val: string) => {
    setSelectedSpecimenFilter(val);
    fetchLogs(val || undefined);
  };

  const handleCreateFeedingLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    const idempotencyKey = uuidv4();

    try {
      const res = await fetch("/api/v1/feeding-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          specimen_id: specimenId,
          diet_type: dietType,
          portion_grams: Number(portionGrams),
          diet_notes: dietNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorBanner(data.error || "Error al registrar la alimentación.");
        return;
      }

      setSuccessBanner("Registro de alimentación guardado exitosamente con Idempotency-Key.");
      setIsModalOpen(false);
      setDietNotes("");
      await fetchLogs(selectedSpecimenFilter || undefined);
    } catch {
      setErrorBanner("Error de conexión al guardar el registro.");
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

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Ingesta</span>
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

      {/* Barra de Filtro por Espécimen */}
      <div className="flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 text-xs">
        <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-bold text-emerald-900 dark:text-emerald-200">Filtrar por animal:</span>
        <select
          value={selectedSpecimenFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-xs font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Todos los especímenes</option>
          {specimens.map((s) => (
            <option key={s.id} value={s.id}>
              {s.common_name}
            </option>
          ))}
        </select>
      </div>

      {/* Listado Cronológico de Alimentación */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando bitácora nutricional...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 text-emerald-900/60 dark:text-emerald-300/60 text-sm">
          No hay registros de alimentación para el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-2xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-md shadow-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-0.5 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-950 dark:text-white">
                    {log.specimen_common_name}
                  </span>
                  <span className="text-xs italic text-emerald-800/70 dark:text-emerald-300/70">
                    ({log.specimen_scientific_name})
                  </span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      log.diet_type === "REGULAR_FEEDING"
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                        : log.diet_type === "MEDICAL_TREATMENT"
                        ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
                        : "bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30"
                    }`}
                  >
                    {log.diet_type}
                  </span>
                </div>

                {log.diet_notes && (
                  <p className="text-xs text-emerald-950/80 dark:text-emerald-100/80 flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{log.diet_notes}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-900/70 dark:text-emerald-300/70 border-t md:border-t-0 pt-2 md:pt-0">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-emerald-950 dark:text-emerald-200">
                    {log.portion_grams} g
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{log.keeper_name || "Cuidador"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{new Date(log.fed_at).toLocaleString("es-ES")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Registro de Alimentación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-600/30 shadow-2xl space-y-5 text-emerald-950 dark:text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Registrar Ingesta / Tratamiento</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeedingLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Espécimen Receptor</label>
                <select
                  required
                  value={specimenId}
                  onChange={(e) => setSpecimenId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {specimens.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.common_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Tipo de Alimentación</label>
                <select
                  value={dietType}
                  onChange={(e) =>
                    setDietType(
                      e.target.value as "REGULAR_FEEDING" | "MEDICAL_TREATMENT" | "EMERGENCY_SUPPLEMENT"
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="REGULAR_FEEDING">REGULAR_FEEDING (Nutrición estándar)</option>
                  <option value="MEDICAL_TREATMENT">MEDICAL_TREATMENT (Dieta con medicación)</option>
                  <option value="EMERGENCY_SUPPLEMENT">EMERGENCY_SUPPLEMENT (Suplemento de emergencia)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Porción en Gramos</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Notas de Dieta / Observaciones</label>
                <textarea
                  required
                  minLength={3}
                  rows={3}
                  value={dietNotes}
                  onChange={(e) => setDietNotes(e.target.value)}
                  placeholder="Se suministró fruta fresca con vitaminas solubles. Ingesta completa sin rechazo."
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
                  <span>Guardar con Idempotencia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
