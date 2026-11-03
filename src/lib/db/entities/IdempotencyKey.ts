import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/**
 * Tabla: idempotency_keys
 * Reside en el schema dinámico del tenant (resuelto mediante search_path)
 */
@Entity({ name: "idempotency_keys" })
export class IdempotencyKey {
  @PrimaryColumn({ type: "varchar", length: 255 })
  key!: string;

  @Column({ type: "varchar", length: 255 })
  request_path!: string;

  @Column({ type: "int" })
  response_code!: number;

  @Column({ type: "jsonb" })
  response_body!: Record<string, unknown> | unknown[];

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;

  @Column({ type: "timestamptz" })
  expires_at!: Date;
}
