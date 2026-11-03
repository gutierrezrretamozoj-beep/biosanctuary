import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "network_messages", schema: "public" })
export class NetworkMessage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  from_tenant_id!: string;

  @Column({ type: "uuid" })
  to_tenant_id!: string;

  @Column({ type: "uuid" })
  sender_user_id!: string;

  @Column({ type: "text" })
  message!: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "now()" })
  sent_at!: Date;
}
