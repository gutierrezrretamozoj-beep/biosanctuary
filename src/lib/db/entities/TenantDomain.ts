import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export type BiomaType =
  | "JUNGLE"
  | "AQUATIC"
  | "SAVANNA"
  | "DESERT"
  | "FOREST";

export type OperationalStatus =
  | "OPTIMAL"
  | "MAINTENANCE_REQUIRED"
  | "UNDER_REPAIR"
  | "QUARANTINE_LOCKED";

export type RescueStatus =
  | "QUARANTINE"
  | "REHABILITATION"
  | "PERMANENT_RESIDENT"
  | "READY_FOR_RELEASE";

export type DietType =
  | "REGULAR_FEEDING"
  | "MEDICAL_TREATMENT"
  | "EMERGENCY_SUPPLEMENT";

/**
 * Tabla: enclosures
 * Reside en el schema dinámico del tenant (resuelto mediante search_path)
 */
@Entity({ name: "enclosures" })
export class Enclosure {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  bioma_type!: BiomaType;

  @Column({ type: "varchar", length: 50, default: "OPTIMAL" })
  operational_status!: OperationalStatus;

  @Column({ type: "int" })
  capacity!: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;
}

/**
 * Tabla: specimens
 * Reside en el schema dinámico del tenant (resuelto mediante search_path)
 */
@Entity({ name: "specimens" })
export class Specimen {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  enclosure_id!: string;

  @Column({ type: "varchar", length: 255 })
  common_name!: string;

  @Column({ type: "varchar", length: 255 })
  scientific_name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  microchip_id!: string | null;

  @Column({ type: "varchar", length: 50, default: "QUARANTINE" })
  rescue_status!: RescueStatus;

  @Column({ type: "numeric", precision: 8, scale: 2 })
  weight_kg!: number;

  @Column({ type: "date" })
  arrival_date!: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;
}

/**
 * Tabla: feeding_logs
 * Reside en el schema dinámico del tenant (resuelto mediante search_path)
 */
@Entity({ name: "feeding_logs" })
export class FeedingLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  specimen_id!: string;

  @Column({ type: "uuid" })
  keeper_id!: string;

  @Column({ type: "varchar", length: 50, default: "REGULAR_FEEDING" })
  diet_type!: DietType;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  portion_grams!: number;

  @Column({ type: "text", nullable: true })
  diet_notes!: string | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  fed_at!: Date;
}

