import {
  EnclosureBiome,
  EnclosureStatus,
  SpecimenStatus,
  FeedingDietType,
  UrgencyLevel,
  UserRole,
} from "@/types";

export const ENCLOSURE_STATUS_LABELS: Record<EnclosureStatus, string> = {
  OPTIMAL: "Óptimo",
  MAINTENANCE_REQUIRED: "Requiere mantenimiento",
  UNDER_REPAIR: "En reparación",
  QUARANTINE_LOCKED: "Bloqueado por cuarentena",
};

export const BIOME_LABELS: Record<EnclosureBiome, string> = {
  JUNGLE: "Selva tropical",
  AQUATIC: "Acuático / Humedal",
  SAVANNA: "Sabana abierta",
  DESERT: "Desierto",
  FOREST: "Bosque",
};

export const SPECIMEN_STATUS_LABELS: Record<SpecimenStatus, string> = {
  QUARANTINE: "Cuarentena",
  REHABILITATION: "Rehabilitación",
  PERMANENT_RESIDENT: "Residente permanente",
  READY_FOR_RELEASE: "Listo para liberación",
};

export const FEEDING_DIET_LABELS: Record<FeedingDietType, string> = {
  REGULAR_FEEDING: "Alimentación regular",
  MEDICAL_TREATMENT: "Tratamiento médico",
  EMERGENCY_SUPPLEMENT: "Suplemento de emergencia",
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  STANDARD: "Estándar",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  DIRECTOR_ADMIN: "Director/a administrador/a",
  FACILITY_LEAD: "Líder de instalaciones",
  VET_OFFICER: "Oficial veterinario",
  ZOOKEEPER: "Cuidador/a",
};
