"use client";

import React, { useState, useEffect } from "react";
import {
  PawPrint,
  Plus,
  Scale,
  Calendar,
  Search,
  Zap,
} from "lucide-react";
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
import { RateLimitBanner } from "@/components/feedback";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { useCountdown } from "@/hooks/useCountdown";
import { Specimen, Enclosure, SpecimenStatus } from "@/types";
import { SPECIMEN_STATUS_LABELS } from "@/lib/labels";
import { apiFetch, ConflictError, RateLimitError } from "@/lib/api/client";

export default function SpecimensPage() {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Rate Limiting 429 State
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const { seconds, isCounting, reset } = useCountdown(rateLimitSeconds, () => {
    setRateLimitSeconds(null);
  });

  // Modal para registro individual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Idempotency Hook
  const { key: idempotencyKey, regenerateKey } = useIdempotencyKey();

  // Form Fields
  const [enclosureId, setEnclosureId] = useState("");
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [microchipId, setMicrochipId] = useState("");
  const [weightKg, setWeightKg] = useState<number>(12.5);

  // Estado del Test Diagnóstico de Idempotencia (Solo para desarrollo)
  const [isTestingIdempotency, setIsTestingIdempotency] = useState(false);
  const [idempotencyReport, setIdempotencyReport] = useState<{
    keyUsed: string;
    request1Status: number;
    request2Status: number;
    specimensCountBefore: number;
    specimensCountAfter: number;
    success: boolean;
  } | null>(null);

  const fetchData = async () => {
    try {
      const [resSpec, resEnc] = await Promise.all([
        apiFetch<{ data: Specimen[] }>("/api/v1/specimens"),
        apiFetch<{ data: Enclosure[] }>("/api/v1/enclosures"),
      ]);

      setSpecimens(resSpec.data || []);
      const encList = resEnc.data || [];
      setEnclosures(encList);

      if (encList.length > 0 && !enclosureId) {
        const availableEnc = encList.find(
          (e) =>
            e.available_slots > 0 &&
            e.operational_status !== "UNDER_REPAIR" &&
            e.operational_status !== "QUARANTINE_LOCKED"
        );
        if (availableEnc) {
          setEnclosureId(availableEnc.id);
        } else {
          setEnclosureId(encList[0].id);
        }
      }
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al obtener los datos de fauna.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRegisterModal = () => {
    regenerateKey();
    setErrorBanner(null);
    setSuccessBanner(null);
    setIsModalOpen(true);
  };

  const handleCreateSpecimen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await apiFetch("/api/v1/specimens", {
        method: "POST",
        idempotencyKey,
        body: JSON.stringify({
          enclosure_id: enclosureId,
          common_name: commonName,
          scientific_name: scientificName,
          microchip_id: microchipId.trim() || undefined,
          rescue_status: "QUARANTINE", // Regla 7.2: Todo ingreso entra en Cuarentena obligatoria
          weight_kg: Number(weightKg),
        }),
      });

      setSuccessBanner(`Espécimen "${commonName}" registrado exitosamente con protocolo de cuarentena.`);
      setIsModalOpen(false);
      setCommonName("");
      setScientificName("");
      setMicrochipId("");
      regenerateKey();
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof ConflictError) {
        setErrorBanner(`Conflicto de asignación: ${err.message}`);
      } else if (err instanceof RateLimitError) {
        setRateLimitSeconds(err.retryAfterSeconds);
        reset(err.retryAfterSeconds);
      } else if (err instanceof Error) {
        setErrorBanner(err.message || "Error al registrar el espécimen.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Test Diagnóstico para Desarrollo
  const handleSimulateIdempotencyDoubleClick = async () => {
    const targetEnc = enclosures.find(
      (e) =>
        e.available_slots > 0 &&
        e.operational_status !== "UNDER_REPAIR" &&
        e.operational_status !== "QUARANTINE_LOCKED"
    );

    if (!targetEnc) {
      setErrorBanner("Se requiere un recinto con cupo disponible y en estado óptimo.");
      return;
    }

    setIsTestingIdempotency(true);
    setIdempotencyReport(null);
    setErrorBanner(null);

    const sharedKey = regenerateKey();
    const testAnimal = {
      enclosure_id: targetEnc.id,
      common_name: `Jaguar Test [${Date.now().toString().slice(-4)}]`,
      scientific_name: "Panthera onca",
      microchip_id: `IDEMP-${Date.now().toString().slice(-6)}`,
      rescue_status: "QUARANTINE",
      weight_kg: 54.2,
    };

    const countBefore = specimens.length;

    try {
      const [p1, p2] = await Promise.all([
        fetch("/api/v1/specimens", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": sharedKey },
          body: JSON.stringify(testAnimal),
        }),
        fetch("/api/v1/specimens", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": sharedKey },
          body: JSON.stringify(testAnimal),
        }),
      ]);

      const refetch = await apiFetch<{ data: Specimen[] }>("/api/v1/specimens");
      const updatedList = refetch.data || [];
      setSpecimens(updatedList);

      const countAfter = updatedList.length;
      const isSuccess = countAfter === countBefore + 1;

      setIdempotencyReport({
        keyUsed: sharedKey,
        request1Status: p1.status,
        request2Status: p2.status,
        specimensCountBefore: countBefore,
        specimensCountAfter: countAfter,
        success: isSuccess,
      });

      if (isSuccess) {
        setSuccessBanner(
          "¡Prueba de Idempotencia Exitosa! Ambas peticiones concurrentes devolvieron respuesta coherente y solo se insertó 1 registro en la base de datos."
        );
      }
    } catch {
      setErrorBanner("Error al ejecutar la prueba de doble clic.");
    } finally {
      setIsTestingIdempotency(false);
    }
  };

  const filteredSpecimens = specimens.filter((sp) => {
    const matchesStatus = statusFilter === "ALL" || sp.rescue_status === statusFilter;
    const matchesSearch =
      sp.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.microchip_id && sp.microchip_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Opciones de recintos con validación de bloqueo biológico
  const enclosureOptions = enclosures.map((enc) => {
    const isLocked =
      enc.operational_status === "UNDER_REPAIR" ||
      enc.operational_status === "QUARANTINE_LOCKED";
    const isFull = enc.current_occupancy >= enc.capacity;
    const disabled = isLocked || isFull;

    let reasonSuffix = "";
    if (enc.operational_status === "UNDER_REPAIR") reasonSuffix = " (En reparación - no disponible)";
    else if (enc.operational_status === "QUARANTINE_LOCKED") reasonSuffix = " (Bloqueado por cuarentena)";
    else if (isFull) reasonSuffix = " (Capacidad máxima alcanzada)";
    else reasonSuffix = ` (${enc.available_slots} cupos libres)`;

    return {
      value: enc.id,
      label: `${enc.name}${reasonSuffix}`,
      disabled,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white flex items-center gap-2.5">
            <PawPrint className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Fauna Rescatada y Gestión Clínica</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 mt-1">
            Registro biológico blindado con Idempotencia (UUIDv4) y control de bioseguridad
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {process.env.NODE_ENV !== "production" && (
            <Button
              variant="secondary"
              size="sm"
              loading={isTestingIdempotency}
              onClick={handleSimulateIdempotencyDoubleClick}
              iconLeft={<Zap className="w-3.5 h-3.5 text-amber-500" />}
            >
              Test Doble Clic
            </Button>
          )}

          <Button
            variant="primary"
            onClick={openRegisterModal}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Registrar Espécimen
          </Button>
        </div>
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

      {/* Reporte del Test Diagnóstico en Desarrollo */}
      {idempotencyReport && process.env.NODE_ENV !== "production" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-100 space-y-2">
          <p className="font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Resultado del Test Diagnóstico de Idempotencia:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>Petición 1: HTTP {idempotencyReport.request1Status}</div>
            <div>Petición 2: HTTP {idempotencyReport.request2Status}</div>
            <div>Antes: {idempotencyReport.specimensCountBefore}</div>
            <div>Después: {idempotencyReport.specimensCountAfter}</div>
          </div>
          <p className="text-[10px] text-amber-900/70 dark:text-amber-300/70 font-mono">
            Key utilizada: {idempotencyReport.keyUsed}
          </p>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre común, científico o RFID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/20 dark:border-emerald-400/20 text-xs sm:text-sm text-emerald-950 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "QUARANTINE", "REHABILITATION", "PERMANENT_RESIDENT", "READY_FOR_RELEASE"] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-white/60 dark:bg-emerald-950/40 text-emerald-900/80 dark:text-emerald-300/80 hover:bg-emerald-500/15"
                }`}
              >
                {status === "ALL" ? "Todos" : SPECIMEN_STATUS_LABELS[status as SpecimenStatus]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Listado de Especímenes */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
          <Spinner size="md" />
          <span>Cargando registros de fauna…</span>
        </div>
      ) : filteredSpecimens.length === 0 ? (
        <EmptyState
          icon={<PawPrint className="w-8 h-8" />}
          title="Sin especímenes encontrados"
          description={
            searchTerm || statusFilter !== "ALL"
              ? "No hay ejemplares que coincidan con los filtros de búsqueda seleccionados."
              : "No hay fauna registrada en este santuario. Registra el primer rescate."
          }
          action={
            <Button variant="primary" onClick={openRegisterModal}>
              Registrar Primer Espécimen
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecimens.map((sp) => (
            <div
              key={sp.id}
              className="p-5 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 space-y-4 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-emerald-950 dark:text-white">
                    {sp.common_name}
                  </h2>
                  <p className="text-xs italic text-emerald-900/70 dark:text-emerald-300/70 font-serif">
                    {sp.scientific_name}
                  </p>
                </div>
                <StatusPill kind={{ type: "specimen", status: sp.rescue_status }} />
              </div>

              <div className="space-y-2 text-xs border-t border-b border-emerald-600/10 dark:border-emerald-400/15 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70">Recinto:</span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                    {sp.enclosure_name || "Recinto asignado"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Peso Clínico:</span>
                  </span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                    {sp.weight_kg} kg
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70">Microchip RFID:</span>
                  <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-300">
                    {sp.microchip_id || "Sin microchip"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-950/70 dark:text-emerald-300/70 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ingreso:</span>
                  </span>
                  <span className="text-emerald-900/80 dark:text-emerald-200/80">
                    {new Date(sp.arrival_date).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Registro de Espécimen */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Espécimen Rescatado"
      >
        <form onSubmit={handleCreateSpecimen} className="space-y-4">
          <Input
            label="Nombre Común"
            id="sp-common"
            required
            value={commonName}
            onChange={(e) => setCommonName(e.target.value)}
            placeholder="Jaguar Melánico"
          />

          <Input
            label="Nombre Científico"
            id="sp-scientific"
            required
            value={scientificName}
            onChange={(e) => setScientificName(e.target.value)}
            placeholder="Panthera onca"
          />

          <Input
            label="Microchip RFID"
            id="sp-microchip"
            optional
            value={microchipId}
            onChange={(e) => setMicrochipId(e.target.value)}
            placeholder="RFID-AMZ-002"
            hint="Código único de transpondedor subcutáneo (opcional)."
          />

          <Input
            label="Peso Inicial (kg)"
            id="sp-weight"
            type="number"
            step="0.1"
            min="0.1"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
          />

          <Select
            label="Recinto de Destino"
            id="sp-enclosure"
            required
            value={enclosureId}
            onChange={(e) => setEnclosureId(e.target.value)}
            options={enclosureOptions}
          />

          {/* Estado Clínico Inicial FIJO en Cuarentena (Regla 7.2) */}
          <div>
            <label
              htmlFor="sp-fixed-status"
              className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-100 mb-1.5"
            >
              Estado Clínico Inicial
            </label>
            <input
              id="sp-fixed-status"
              type="text"
              readOnly
              disabled
              value="Cuarentena (Protocolo de Bioseguridad Obligatorio)"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-emerald-900/60 dark:text-emerald-300/60">
              Todo nuevo ejemplar ingresa obligatoriamente a Cuarentena para control veterinario.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-600/15 dark:border-emerald-400/15">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Registrar Espécimen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
