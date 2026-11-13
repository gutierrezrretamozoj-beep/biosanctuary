"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Textarea,
  GlassPanel,
  Banner,
  Badge,
  StatusPill,
  Modal,
  Spinner,
  Skeleton,
  EmptyState,
  DayNightSwitch,
} from "@/components/ui";
import { RateLimitBanner, ForbiddenNotice } from "@/components/feedback";
import { Compass, PawPrint, Mail, Lock, Sparkles } from "lucide-react";

export default function DevComponentsShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [rateSeconds, setRateSeconds] = useState(25);

  return (
    <div className="min-h-screen p-6 sm:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-emerald-950 dark:text-white">
            Catálogo Oficial de Componentes UI
          </h1>
          <p className="text-sm text-emerald-900/70 dark:text-emerald-300/70">
            Fase 2 — BioSanctuary OS Design System (tokens, vidrio, accesibilidad y estados)
          </p>
        </div>
        <DayNightSwitch />
      </div>

      {/* Botones */}
      <GlassPanel>
        <h2 className="text-lg font-bold mb-4 text-emerald-950 dark:text-emerald-50">1. Botones (Button)</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary" iconLeft={<Sparkles className="w-4 h-4" />}>
            Primario
          </Button>
          <Button variant="secondary">Secundario Vidrio</Button>
          <Button variant="ghost">Fantasma (Ghost)</Button>
          <Button variant="danger">Peligro (Danger)</Button>
          <Button
            variant="primary"
            loading={btnLoading}
            onClick={() => {
              setBtnLoading(true);
              setTimeout(() => setBtnLoading(false), 2000);
            }}
          >
            Probar Carga
          </Button>
          <Button variant="primary" disabled>
            Deshabilitado
          </Button>
        </div>
      </GlassPanel>

      {/* Formularios */}
      <GlassPanel>
        <h2 className="text-lg font-bold mb-4 text-emerald-950 dark:text-emerald-50">2. Campos de Entrada (Form Controls)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Correo Electrónico"
            id="dev-email"
            icon={<Mail className="w-4 h-4" />}
            placeholder="usuario@santuario.org"
            required
          />
          <Input
            label="Contraseña"
            id="dev-password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            error="La contraseña debe tener al menos 8 caracteres"
            required
          />
          <Select
            label="Bioma del Recinto"
            id="dev-biome"
            icon={<Compass className="w-4 h-4" />}
            options={[
              { value: "JUNGLE", label: "Selva tropical" },
              { value: "AQUATIC", label: "Acuático / Humedal" },
              { value: "SAVANNA", label: "Sabana abierta" },
            ]}
          />
          <Textarea
            label="Notas Clínicas"
            id="dev-notes"
            optional
            hint="Describe observaciones sobre la conducta o dieta del espécimen."
          />
        </div>
      </GlassPanel>

      {/* Píldoras de Estado y Badges */}
      <GlassPanel>
        <h2 className="text-lg font-bold mb-4 text-emerald-950 dark:text-emerald-50">3. StatusPill y Badges</h2>
        <div className="flex flex-wrap gap-2.5 items-center mb-4">
          <StatusPill kind={{ type: "enclosure", status: "OPTIMAL" }} />
          <StatusPill kind={{ type: "enclosure", status: "MAINTENANCE_REQUIRED" }} />
          <StatusPill kind={{ type: "enclosure", status: "UNDER_REPAIR" }} />
          <StatusPill kind={{ type: "enclosure", status: "QUARANTINE_LOCKED" }} />
        </div>
        <div className="flex flex-wrap gap-2.5 items-center mb-4">
          <StatusPill kind={{ type: "specimen", status: "QUARANTINE" }} />
          <StatusPill kind={{ type: "specimen", status: "REHABILITATION" }} />
          <StatusPill kind={{ type: "specimen", status: "PERMANENT_RESIDENT" }} />
          <StatusPill kind={{ type: "specimen", status: "READY_FOR_RELEASE" }} />
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <StatusPill kind={{ type: "urgency", status: "STANDARD" }} />
          <StatusPill kind={{ type: "urgency", status: "HIGH" }} />
          <StatusPill kind={{ type: "urgency", status: "CRITICAL" }} />
        </div>
      </GlassPanel>

      {/* Feedback & Notificaciones */}
      <GlassPanel>
        <h2 className="text-lg font-bold mb-4 text-emerald-950 dark:text-emerald-50">4. Banners y Retroalimentación</h2>
        <div className="space-y-3">
          <Banner type="success" message="Espécimen registrado exitosamente en el esquema dedicado." onDismiss={() => {}} />
          <Banner type="warning" message="El recinto Selva Nubosa se encuentra al 90% de su capacidad máxima permitida." />
          <Banner type="error" message="No fue posible sincronizar los datos de transferencia con el santuario remoto." />
          <RateLimitBanner seconds={rateSeconds} onFinished={() => setRateSeconds(0)} />
          <ForbiddenNotice requiredRoles={["DIRECTOR_ADMIN", "FACILITY_LEAD"]} actionName="la modificación de recintos" />
        </div>
      </GlassPanel>

      {/* Modal & Estados Vacíos */}
      <GlassPanel>
        <h2 className="text-lg font-bold mb-4 text-emerald-950 dark:text-emerald-50">5. Modales y Estados Vacíos</h2>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Abrir Modal de Prueba
          </Button>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ventana Modal Accesible">
          <p className="text-sm text-emerald-950 dark:text-emerald-100 mb-4 leading-relaxed">
            Esta ventana modal implementa captura de foco, tecla Escape para cierre rápido y panel con receta única de glassmorphism.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Aceptar
            </Button>
          </div>
        </Modal>

        <div className="mt-6">
          <EmptyState
            icon={<PawPrint className="w-6 h-6" />}
            title="Sin registros de fauna en cuarentena"
            description="Todos los ejemplares asignados a este santuario han superado la etapa inicial de cuarentena clínica."
            action={<Button variant="primary">Registrar Nuevo Ingreso</Button>}
          />
        </div>
      </GlassPanel>
    </div>
  );
}
