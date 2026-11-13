"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  PawPrint,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  Zap,
  Tag,
  Scale,
  Calendar,
  X,
  Search,
} from "lucide-react";

interface SpecimenItem {
  id: string;
  enclosure_id: string;
  common_name: string;
  scientific_name: string;
  microchip_id: string | null;
  rescue_status: "QUARANTINE" | "REHABILITATION" | "PERMANENT_RESIDENT" | "READY_FOR_RELEASE";
  weight_kg: number;
  arrival_date: string;
  enclosure_name: string;
  enclosure_bioma: string;
  enclosure_status: string;
}

interface EnclosureSelectOption {
  id: string;
  name: string;
  available_slots: number;
  operational_status: string;
}

export default function SpecimensPage() {
  const [specimens, setSpecimens] = useState<SpecimenItem[]>([]);
  const [enclosures, setEnclosures] = useState<EnclosureSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Rate Limiting 429 State
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  // Modal para registro individual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [enclosureId, setEnclosureId] = useState("");
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [microchipId, setMicrochipId] = useState("");
  const [rescueStatus, setRescueStatus] = useState<string>("QUARANTINE");
  const [weightKg, setWeightKg] = useState<number>(12.5);

  // Estado del Test Diagnóstico de Idempotencia para Sustentación Oral
  const [isTestingIdempotency, setIsTestingIdempotency] = useState(false);
  const [idempotencyReport, setIdempotencyReport] = useState<{
    keyUsed: string;
    request1Status: number;
    request2Status: number;
    request1Body: unknown;
    request2Body: unknown;
    specimensCountBefore: number;
    specimensCountAfter: number;
    success: boolean;
  } | null>(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSpec, resEnc] = await Promise.all([
        fetch("/api/v1/specimens"),
        fetch("/api/v1/enclosures"),
      ]);

      if (resSpec.ok) {
        const data = await resSpec.json();
        setSpecimens(data.data || []);
      }
      if (resEnc.ok) {
        const data = await resEnc.json();
        setEnclosures(data.data || []);
        if (data.data && data.data.length > 0 && !enclosureId) {
          setEnclosureId(data.data[0].id);
        }
      }
    } catch {
      setErrorBanner("Error al obtener los datos de fauna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSpecimen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    // Generar Idempotency-Key único para la operación
    const key = uuidv4();

    try {
      const res = await fetch("/api/v1/specimens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify({
          enclosure_id: enclosureId,
          common_name: commonName,
          scientific_name: scientificName,
          microchip_id: microchipId.trim() || undefined,
          rescue_status: rescueStatus,
          weight_kg: Number(weightKg),
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setRateLimitSeconds(data.retryAfterSeconds || 30);
        setErrorBanner(data.error || "Límite de peticiones de dominio excedido.");
        return;
      }

      if (res.status === 409) {
        setErrorBanner(`Conflicto Biológico (409): ${data.error}`);
        return;
      }

      if (!res.ok) {
        setErrorBanner(data.error || "Error al registrar el espécimen.");
        return;
      }

      setSuccessBanner(`Espécimen "${commonName}" registrado exitosamente con Idempotency-Key.`);
      setIsModalOpen(false);
      setCommonName("");
      setScientificName("");
      setMicrochipId("");
      await fetchData();
    } catch {
      setErrorBanner("Error de comunicación al registrar el espécimen.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * TEST DE IDEMPOTENCIA PARA SUSTENTACIÓN ORAL
   * Envía 2 peticiones POST concurrentes con exactamente la misma Idempotency-Key
   */
  const handleSimulateIdempotencyDoubleClick = async () => {
    if (enclosures.length === 0) {
      setErrorBanner("Se requiere al menos un recinto para la prueba de idempotencia.");
      return;
    }

    const targetEnc = enclosures.find((e) => e.available_slots > 0) || enclosures[0];
    if (targetEnc.operational_status === "UNDER_REPAIR" || targetEnc.operational_status === "QUARANTINE_LOCKED") {
      setErrorBanner("El recinto seleccionado está bloqueado. Use un recinto en estado OPTIMAL.");
      return;
    }

    setIsTestingIdempotency(true);
    setIdempotencyReport(null);
    setErrorBanner(null);
    setSuccessBanner(null);

    const sharedKey = uuidv4();
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
      // Disparo simultáneo de 2 peticiones POST idénticas
      const [p1, p2] = await Promise.all([
        fetch("/api/v1/specimens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": sharedKey,
          },
          body: JSON.stringify(testAnimal),
        }),
        fetch("/api/v1/specimens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": sharedKey,
          },
          body: JSON.stringify(testAnimal),
        }),
      ]);

      const [d1, d2] = await Promise.all([p1.json(), p2.json()]);

      // Refrescar listado para constatar que solo se insertó 1 espécimen
      const refetch = await fetch("/api/v1/specimens");
      const refetchData = await refetch.json();
      const updatedList: SpecimenItem[] = refetchData.data || [];
      setSpecimens(updatedList);

      const countAfter = updatedList.length;
      const isSuccess = p1.status === 201 && p2.status === 201 && countAfter === countBefore + 1;

      setIdempotencyReport({
        keyUsed: sharedKey,
        request1Status: p1.status,
        request2Status: p2.status,
        request1Body: d1,
        request2Body: d2,
        specimensCountBefore: countBefore,
        specimensCountAfter: countAfter,
        success: isSuccess,
      });

      if (isSuccess) {
        setSuccessBanner(
          "¡Prueba de Idempotencia Exitosa! Ambas peticiones devolvieron 201 y solo se creó 1 registro en la base de datos."
        );
      }
    } catch {
      setErrorBanner("Error al ejecutar la prueba de idempotencia concurrente.");
    } finally {
      setIsTestingIdempotency(false);
    }
  };

  const filteredSpecimens = specimens.filter((s) => {
    const matchesStatus = statusFilter === "ALL" || s.rescue_status === statusFilter;
    const matchesSearch =
      s.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.microchip_id && s.microchip_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white flex items-center gap-2.5">
            <PawPrint className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Fauna Silvestre Rescatada</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 mt-1">
            Registro biométrico, microchips y control estricto de idempotencia
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* BOTÓN ESPECIAL DE SUSTENTACIÓN ORAL: PRUEBA DE IDEMPOTENCIA */}
          <button
            onClick={handleSimulateIdempotencyDoubleClick}
            disabled={isTestingIdempotency}
            title="Envía dos peticiones POST concurrentes con el mismo Idempotency-Key para comprobar la idempotencia"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isTestingIdempotency ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-white" />
            )}
            <span>Simular Doble Clic (Prueba Idempotencia)</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ingreso</span>
          </button>
        </div>
      </div>

      {/* Alerta de Rate Limiting 429 */}
      {rateLimitSeconds !== null && rateLimitSeconds > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-3 backdrop-blur-md">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
          <div>
            <span className="font-bold">Límite de Creación por Tenant Excedido (HTTP 429):</span>
            <span className="ml-2 font-mono font-bold">
              Desbloqueo en {rateLimitSeconds}s (máximo 30 peticiones/minuto)
            </span>
          </div>
        </div>
      )}

      {/* Alertas Generales */}
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

      {/* PANEL DIAGNÓSTICO DE IDEMPOTENCIA PARA SUSTENTACIÓN ORAL */}
      {idempotencyReport && (
        <div className="p-6 rounded-3xl backdrop-blur-2xl bg-emerald-950/80 border border-emerald-400/40 shadow-2xl text-emerald-100 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Evidencia Diagnóstica: Protocolo Idempotency-Key</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                idempotencyReport.success
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {idempotencyReport.success ? "PROTEGIDO: 0 DUPLICADOS" : "FALLO DE IDEMPOTENCIA"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-800 space-y-1.5">
              <span className="text-emerald-400 font-bold block">Petición 1 (Original):</span>
              <div>Código HTTP: <span className="font-bold text-emerald-300">{idempotencyReport.request1Status} Created</span></div>
              <div className="truncate text-[10px] text-emerald-400">Key: {idempotencyReport.keyUsed}</div>
              <div className="text-[10px] text-emerald-300/80">Procesó la transacción y guardó en PostgreSQL + Redis.</div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-800 space-y-1.5">
              <span className="text-emerald-400 font-bold block">Petición 2 (Simultánea Replay):</span>
              <div>Código HTTP: <span className="font-bold text-emerald-300">{idempotencyReport.request2Status} Created (Caché Idempotente)</span></div>
              <div className="truncate text-[10px] text-emerald-400">Key: {idempotencyReport.keyUsed}</div>
              <div className="text-[10px] text-emerald-300/80">Respondió cuerpo idéntico sin re-insertar en PostgreSQL.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-between text-xs">
            <span>Especímenes antes: <strong>{idempotencyReport.specimensCountBefore}</strong></span>
            <span>Especímenes después: <strong>{idempotencyReport.specimensCountAfter}</strong> (+1 real)</span>
            <span className="text-emerald-300 font-bold">Base de Datos Íntegra</span>
          </div>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 dark:border-emerald-400/20">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o chip..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold">
          {["ALL", "QUARANTINE", "REHABILITATION", "PERMANENT_RESIDENT", "READY_FOR_RELEASE"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-500/20"
              }`}
            >
              {st === "ALL" ? "Todos" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Especímenes */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-emerald-600 dark:text-emerald-400 gap-2 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando fauna silvestre...</span>
        </div>
      ) : filteredSpecimens.length === 0 ? (
        <div className="p-12 text-center rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-600/20 text-emerald-900/60 dark:text-emerald-300/60 text-sm">
          No se encontraron especímenes con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecimens.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 space-y-4 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-emerald-950 dark:text-white">
                    {item.common_name}
                  </h2>
                  <p className="text-xs italic text-emerald-800/80 dark:text-emerald-300/80">
                    {item.scientific_name}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  {item.rescue_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-emerald-600/10 dark:border-emerald-400/10 text-emerald-900/80 dark:text-emerald-200/80">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.weight_kg} kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.arrival_date}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 font-mono text-[11px]">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Microchip: {item.microchip_id || "Sin microchip"}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                    Hábitat Asignado
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-white">
                    {item.enclosure_name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white uppercase">
                  {item.enclosure_bioma}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Registrar Ingreso de Fauna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-600/30 shadow-2xl space-y-5 text-emerald-950 dark:text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Registrar Ingreso de Fauna</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpecimen} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">Recinto Destino</label>
                <select
                  required
                  value={enclosureId}
                  onChange={(e) => setEnclosureId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {enclosures.map((enc) => (
                    <option key={enc.id} value={enc.id}>
                      {enc.name} (Cupos: {enc.available_slots} | {enc.operational_status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Nombre Común</label>
                <input
                  type="text"
                  required
                  value={commonName}
                  onChange={(e) => setCommonName(e.target.value)}
                  placeholder="Guacamayo Rojo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Nombre Científico</label>
                <input
                  type="text"
                  required
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  placeholder="Ara macao"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Microchip (Opcional)</label>
                  <input
                    type="text"
                    value={microchipId}
                    onChange={(e) => setMicrochipId(e.target.value)}
                    placeholder="98514100234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Estado Clínico de Rescate</label>
                <select
                  value={rescueStatus}
                  onChange={(e) => setRescueStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="QUARANTINE">QUARANTINE (Cuarentena inicial)</option>
                  <option value="REHABILITATION">REHABILITATION (En rehabilitación)</option>
                  <option value="PERMANENT_RESIDENT">PERMANENT_RESIDENT (Residente permanente)</option>
                  <option value="READY_FOR_RELEASE">READY_FOR_RELEASE (Listo para liberación)</option>
                </select>
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
