import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "tenants", schema: "public" })
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 63, unique: true })
  schema_name!: string;

  @Column({ type: "boolean", default: false })
  allow_network_collaboration!: boolean;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "now()" })
  updated_at!: Date;
}

