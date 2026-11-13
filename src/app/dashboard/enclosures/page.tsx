"use client";

import React, { useState, useEffect } from "react";
import { Compass, Plus, Users, Settings2 } from "lucide-react";
import { DynamicBiomeHabitat } from "@/components/3d/DynamicBiomeHabitat";
import {
  Button,
  Input,
  Select,
  Modal,
  Banner,
  StatusPill,
  EmptyState,
  Spinner,
} from "@/components/ui";
import { RateLimitBanner, ForbiddenNotice } from "@/components/feedback";
import { useRole } from "@/hooks/useRole";
import { useCountdown } from "@/hooks/useCountdown";
import { Enclosure, EnclosureBiome, EnclosureStatus } from "@/types";
import { BIOME_LABELS } from "@/lib/labels";
import { apiFetch, ConflictError, ForbiddenError, RateLimitError } from "@/lib/api/client";

export default function EnclosuresPage() {
  const { canManageEnclosures, loading: roleLoading } = useRole();
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Rate Limiting 429
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const { seconds, isCounting, reset } = useCountdown(rateLimitSeconds, () => {
    setRateLimitSeconds(null);
  });

  // Modal para nuevo recinto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBioma, setNewBioma] = useState<EnclosureBiome>("JUNGLE");
  const [newCapacity, setNewCapacity] = useState<number>(5);
  const [newStatus, setNewStatus] = useState<EnclosureStatus>("OPTIMAL");

  // Estado para actualización inline de estado
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnclosures = async () => {
    try {
      const res = await apiFetch<{ data: Enclosure[] }>("/api/v1/enclosures");
      setEnclosures(res.data || []);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al cargar los recintos.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnclosures();
  }, []);

  const handleStatusChange = async (enclosureId: string, newOpStatus: EnclosureStatus) => {
    if (!canManageEnclosures) return;
    setUpdatingId(enclosureId);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await apiFetch(`/api/v1/enclosures/${enclosureId}`, {
        method: "PATCH",
        body: JSON.stringify({ operational_status: newOpStatus }),
      });

      setSuccessBanner("Estado del recinto actualizado exitosamente.");
      await fetchEnclosures();
    } catch (err: unknown) {
      if (err instanceof ConflictError) {
        setErrorBanner(
          `Conflicto Biológico: ${err.message || "No se puede cambiar a reparación con animales residentes. Reubícalos primero."}`
        );
      } else if (err instanceof ForbiddenError) {
        setErrorBanner("Acceso denegado: Solo Director/a o Líder de instalaciones pueden cambiar estados.");
      } else if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al actualizar el estado del recinto.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateEnclosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageEnclosures) return;

    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await apiFetch("/api/v1/enclosures", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          bioma_type: newBioma,
          capacity: Number(newCapacity),
          operational_status: newStatus,
        }),
      });

      setSuccessBanner("Nuevo hábitat creado exitosamente en el schema del santuario.");
      setIsModalOpen(false);
      setNewName("");
      setNewCapacity(5);
      setNewStatus("OPTIMAL");
      await fetchEnclosures();
    } catch (err: unknown) {
      if (err instanceof ForbiddenError) {
        setErrorBanner("Acceso denegado: Solo Director/a o Líder de instalaciones pueden crear recintos.");
      } else if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al crear el recinto.");
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
            <Compass className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Recintos y Hábitats 3D</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 mt-1">
            Gestión de capacidad biológica y visualización procedural por bioma
          </p>
        </div>

        {canManageEnclosures ? (
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Crear Recinto
          </Button>
        ) : (
          <div title="Se requiere rol de Director o Líder de instalaciones">
            <Button variant="primary" disabled iconLeft={<Plus className="w-4 h-4" />}>
              Crear Recinto
            </Button>
          </div>
        )}
      </div>

      {!canManageEnclosures && !roleLoading && (
        <ForbiddenNotice
          requiredRoles={["DIRECTOR_ADMIN", "FACILITY_LEAD"]}
          actionName="la creación y modificación de recintos"
        />
      )}

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

      {/* Listado de Recintos con Visores 3D */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
          <Spinner size="md" />
          <span>Cargando recintos y renderizando hábitats 3D…</span>
        </div>
      ) : enclosures.length === 0 ? (
        <EmptyState
          icon={<Compass className="w-8 h-8" />}
          title="Sin recintos registrados"
          description="Aún no hay recintos creados en este santuario. Crea el primer hábitat para albergar fauna."
          action={
            canManageEnclosures && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Crear Primer Recinto
              </Button>
            )
          }
        />
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
                    {BIOME_LABELS[enc.bioma_type] || enc.bioma_type}
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
                        ID: {enc.id.slice(0, 8)}…
                      </span>
                    </div>

                    <StatusPill kind={{ type: "enclosure", status: enc.operational_status }} />
                  </div>

                  {/* Barra de Ocupación */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-950/80 dark:text-emerald-200/80">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Ocupación</span>
                      </span>
                      <span>
                        {enc.current_occupancy} / {enc.capacity} animales ({occPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-emerald-900/10 dark:bg-emerald-400/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? "bg-red-500"
                            : occPercent > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(occPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Advertencia si está bloqueado */}
                  {isLocked && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
                      Recinto no disponible para nuevos ingresos por mantenimiento o cuarentena.
                    </div>
                  )}

                  {/* Selector inline de Estado Operativo */}
                  {canManageEnclosures && (
                    <div className="pt-3 border-t border-emerald-600/10 dark:border-emerald-400/15 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-950/70 dark:text-emerald-300/70 flex items-center gap-1">
                        <Settings2 className="w-3 h-3" />
                        <span>Cambiar Estado:</span>
                      </span>

                      <select
                        value={enc.operational_status}
                        disabled={updatingId === enc.id}
                        onChange={(e) =>
                          handleStatusChange(enc.id, e.target.value as EnclosureStatus)
                        }
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/70 dark:bg-emerald-900/60 border border-emerald-600/20 dark:border-emerald-400/20 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer disabled:opacity-50"
                      >
                        <option value="OPTIMAL" className="bg-emerald-950 text-white">
                          Óptimo
                        </option>
                        <option value="MAINTENANCE_REQUIRED" className="bg-emerald-950 text-white">
                          Requiere mantenimiento
                        </option>
                        <option value="UNDER_REPAIR" className="bg-emerald-950 text-white">
                          En reparación
                        </option>
                        <option value="QUARANTINE_LOCKED" className="bg-emerald-950 text-white">
                          Bloqueado por cuarentena
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Recinto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Recinto y Hábitat 3D"
      >
        <form onSubmit={handleCreateEnclosure} className="space-y-4">
          <Input
            label="Nombre del Recinto"
            id="enc-name"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Recinto Selva Nubosa 2"
          />

          <Select
            label="Bioma del Hábitat"
            id="enc-bioma"
            required
            value={newBioma}
            onChange={(e) => setNewBioma(e.target.value as EnclosureBiome)}
            options={[
              { value: "JUNGLE", label: "Selva tropical" },
              { value: "AQUATIC", label: "Acuático / Humedal" },
              { value: "SAVANNA", label: "Sabana abierta" },
              { value: "DESERT", label: "Desierto" },
              { value: "FOREST", label: "Bosque" },
            ]}
          />

          <Input
            label="Capacidad Máxima de Especímenes"
            id="enc-capacity"
            type="number"
            min={1}
            max={50}
            required
            value={newCapacity}
            onChange={(e) => setNewCapacity(Number(e.target.value))}
          />

          <Select
            label="Estado Operativo Inicial"
            id="enc-status"
            required
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as EnclosureStatus)}
            options={[
              { value: "OPTIMAL", label: "Óptimo" },
              { value: "MAINTENANCE_REQUIRED", label: "Requiere mantenimiento" },
              { value: "UNDER_REPAIR", label: "En reparación" },
              { value: "QUARANTINE_LOCKED", label: "Bloqueado por cuarentena" },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-600/15 dark:border-emerald-400/15">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Guardar Hábitat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
