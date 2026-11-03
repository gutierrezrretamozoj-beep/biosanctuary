import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export type TransferUrgency = "STANDARD" | "HIGH" | "CRITICAL";
export type TransferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

@Entity({ name: "transfer_requests", schema: "public" })
export class TransferRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  from_tenant_id!: string;

  @Column({ type: "uuid" })
  to_tenant_id!: string;

  @Column({ type: "varchar", length: 255 })
  species_name!: string;

  @Column({ type: "varchar", length: 50, default: "STANDARD" })
  urgency!: TransferUrgency;

  @Column({ type: "text" })
  reason!: string;

  @Column({ type: "varchar", length: 50, default: "PENDING" })
  status!: TransferStatus;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;
}
