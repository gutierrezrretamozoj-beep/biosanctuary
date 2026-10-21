import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type UserRole =
  | "DIRECTOR_ADMIN"
  | "VET_OFFICER"
  | "ZOOKEEPER"
  | "FACILITY_LEAD";

@Entity({ name: "users", schema: "public" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  tenant_id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "text" })
  password_hash!: string;

  @Column({ type: "varchar", length: 255 })
  full_name!: string;

  @Column({ type: "varchar", length: 50 })
  role!: UserRole;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "now()" })
  updated_at!: Date;
}

