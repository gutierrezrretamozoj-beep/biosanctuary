"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Users,
  Settings2,
  X,
} from "lucide-react";
import { DynamicBiomeHabitat } from "@/components/3d/DynamicBiomeHabitat";
import type { BiomaType } from "@/components/3d/BiomeHabitat3D";

interface EnclosureItem {
  id: string;
  name: string;
  bioma_type: BiomaType;
  operational_status: "OPTIMAL" | "MAINTENANCE_REQUIRED" | "UNDER_REPAIR" | "QUARANTINE_LOCKED";
  capacity: number;
  current_occupancy: number;
  available_slots: number;
  created_at: string;
}

export default function EnclosuresPage() {
  const [enclosures, setEnclosures] = useState<EnclosureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal para nuevo recinto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBioma, setNewBioma] = useState<BiomaType>("JUNGLE");
  const [newCapacity, setNewCapacity] = useState<number>(5);
  const [newStatus, setNewStatus] = useState<string>("OPTIMAL");

  // Estado para actualización inline de estado
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnclosures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/enclosures");
      if (res.ok) {
        const data = await res.json();
        setEnclosures(data.data || []);
      } else {
        const err = await res.json();
        setErrorBanner(err.error || "Error al cargar los recintos.");
      }
    } catch {
      setErrorBanner("Error de conexión al cargar los recintos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnclosures();
  }, []);

  const handleStatusChange = async (enclosureId: string, newOpStatus: string) => {
    setUpdatingId(enclosureId);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const res = await fetch(`/api/v1/enclosures/${enclosureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operational_status: newOpStatus }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setErrorBanner(
          `Conflicto Biológico (409): ${data.error || "No se puede cambiar a reparación con animales residentes. Reubíquelos primero."}`
        );
        return;
      }

      if (res.status === 403) {
        setErrorBanner("Acceso denegado (403): Solo DIRECTOR_ADMIN o FACILITY_LEAD pueden cambiar estados.");
        return;
      }

      if (!res.ok) {
        setErrorBanner(data.error || "Error al actualizar el estado del recinto.");
        return;
      }

      setSuccessBanner("Estado del recinto actualizado exitosamente.");
      await fetchEnclosures();
    } catch {
      setErrorBanner("Error de comunicación al actualizar el recinto.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateEnclosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const res = await fetch("/api/v1/enclosures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          bioma_type: newBioma,
          capacity: Number(newCapacity),
          operational_status: newStatus,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setErrorBanner("Acceso denegado (403): Solo DIRECTOR_ADMIN o FACILITY_LEAD pueden crear recintos.");
        return;
      }

      if (!res.ok) {
        setErrorBanner(data.error || "Error al crear el recinto.");
        return;
      }

      setSuccessBanner("Nuevo hábitat creado exitosamente en el schema del santuario.");
      setIsModalOpen(false);
      setNewName("");
      setNewCapacity(5);
      await fetchEnclosures();
    } catch {
      setErrorBanner("Error de comunicación al crear el recinto.");
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
            <Compass className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Recintos y Hábitats 3D</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 mt-1">
            Gestión de capacidad biológica y visualización procedural por bioma
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Recinto</span>
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

      {/* Listado de Recintos con Visores 3D */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando recintos y renderizando hábitats 3D...</span>
        </div>
      ) : enclosures.length === 0 ? (
        <div className="p-12 text-center rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 text-emerald-900/60 dark:text-emerald-300/60 text-sm">
          No hay recintos creados en este santuario. Haz clic en &quot;Crear Recinto&quot; para registrar el primero.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enclosures.map((enc) => {
            const occPercent = Math.round((enc.current_occupancy / enc.capacity) * 100);
            const isFull = enc.current_occupancy >= enc.capacity;
            const isLocked =
              enc.operational_status === "UNDER_REPAIR" ||
              enc.operational_status === "QUARANTINE_LOCKED";

            return (
              <div
                key={enc.id}
                className="rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all"
              >
                {/* Visor 3D Interactivo según Bioma */}
                <div className="relative">
                  <DynamicBiomeHabitat bioma={enc.bioma_type} />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {enc.bioma_type}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Nombre y Estado */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-emerald-950 dark:text-white">
                        {enc.name}
                      </h2>
                      <span className="text-[11px] text-emerald-900/60 dark:text-emerald-300/60 font-mono">
                        ID: {enc.id.slice(0, 8)}...
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        enc.operational_status === "OPTIMAL"
                          ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                          : enc.operational_status === "MAINTENANCE_REQUIRED"
                          ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
                          : "bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30"
                      }`}
                    >
                      {enc.operational_status}
                    </span>
                  </div>

                  {/* Barra de Ocupación */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-950/80 dark:text-emerald-200/80">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Ocupación</span>
                      </span>
                      <span>
                        {enc.current_occupancy} / {enc.capacity} ({occPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-emerald-950/20 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-red-500" : occPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, occPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-emerald-900/60 dark:text-emerald-300/60">
                      <span>Cupos libres: {enc.available_slots}</span>
                      {isLocked && (
                        <span className="text-red-600 dark:text-red-400 font-bold">Bloqueado para ingresos</span>
                      )}
                    </div>
                  </div>

                  {/* Selector de Estado Operativo (PATCH) */}
                  <div className="pt-3 border-t border-emerald-600/15 dark:border-emerald-400/15 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-900/70 dark:text-emerald-300/70 flex items-center gap-1">
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Estado:</span>
                    </span>

                    <select
                      value={enc.operational_status}
                      disabled={updatingId === enc.id}
                      onChange={(e) => handleStatusChange(enc.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-emerald-950/70 border border-emerald-600/30 dark:border-emerald-400/30 text-xs font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="OPTIMAL">OPTIMAL</option>
                      <option value="MAINTENANCE_REQUIRED">MAINTENANCE_REQUIRED</option>
                      <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                      <option value="QUARANTINE_LOCKED">QUARANTINE_LOCKED</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Recinto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-600/30 shadow-2xl space-y-5 text-emerald-950 dark:text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Crear Nuevo Recinto</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnclosure} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Nombre del Hábitat</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Recinto Felinos del Amazonas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Tipo de Bioma</label>
                <select
                  value={newBioma}
                  onChange={(e) => setNewBioma(e.target.value as BiomaType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="JUNGLE">JUNGLE (Selva tropical)</option>
                  <option value="AQUATIC">AQUATIC (Acuático / Humedal)</option>
                  <option value="SAVANNA">SAVANNA (Sabana abierta)</option>
                  <option value="DESERT">DESERT (Desierto árido)</option>
                  <option value="FOREST">FOREST (Bosque templado)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Capacidad Máxima</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Estado Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="OPTIMAL">OPTIMAL</option>
                    <option value="MAINTENANCE_REQUIRED">MAINTENANCE_REQUIRED</option>
                  </select>
                </div>
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
                  <span>Guardar Recinto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
