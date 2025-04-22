// src/ws/entities/ws-batch-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({
  synchronize: true
})
export class WsBatchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bundleId: string;

  @Column({ type: 'jsonb' })
  log: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
