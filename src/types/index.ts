export type EnclosureBiome =
  | "JUNGLE"
  | "AQUATIC"
  | "SAVANNA"
  | "DESERT"
  | "FOREST";

export type EnclosureStatus =
  | "OPTIMAL"
  | "MAINTENANCE_REQUIRED"
  | "UNDER_REPAIR"
  | "QUARANTINE_LOCKED";

export interface Enclosure {
  id: string;
  name: string;
  bioma_type: EnclosureBiome;
  operational_status: EnclosureStatus;
  capacity: number;
  current_occupancy: number;
  available_slots: number;
  created_at: string;
}

export type SpecimenStatus =
  | "QUARANTINE"
  | "REHABILITATION"
  | "PERMANENT_RESIDENT"
  | "READY_FOR_RELEASE";

export interface Specimen {
  id: string;
  enclosure_id: string;
  common_name: string;
  scientific_name: string;
  microchip_id: string | null;
  rescue_status: SpecimenStatus;
  weight_kg: string | number;
  arrival_date: string;
  created_at: string;
  enclosure_name?: string;
  enclosure_bioma?: EnclosureBiome;
  enclosure_status?: EnclosureStatus;
}

export type FeedingDietType =
  | "REGULAR_FEEDING"
  | "MEDICAL_TREATMENT"
  | "EMERGENCY_SUPPLEMENT";

export interface FeedingLog {
  id: string;
  specimen_id: string;
  keeper_id?: string;
  portion_grams: number;
  diet_type: FeedingDietType;
  diet_notes: string | null;
  logged_at?: string;
  created_at: string;
  specimen_name?: string;
  keeper_name?: string;
}

export type UserRole =
  | "DIRECTOR_ADMIN"
  | "FACILITY_LEAD"
  | "VET_OFFICER"
  | "ZOOKEEPER";

export interface AuthUser {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  role: UserRole;
  email: string;
  fullName?: string;
}

export interface Sanctuary {
  id: string;
  slug: string;
  name: string;
  schema_name: string;
  allow_network_collaboration: boolean;
  is_active: boolean;
  created_at: string;
}

export type UrgencyLevel = "STANDARD" | "HIGH" | "CRITICAL";

export interface TransferRequest {
  id: string;
  specimen_id: string;
  origin_tenant_id: string;
  target_tenant_id: string;
  urgency_level: UrgencyLevel;
  reason: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  created_at: string;
  direction?: "INCOMING" | "OUTGOING";
  specimen_name?: string;
  origin_tenant_name?: string;
  target_tenant_name?: string;
}
