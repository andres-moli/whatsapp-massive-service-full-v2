// entities/ws-batch-detail.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
export enum WsBatchStatus {
    PENDIENTE = 'PENDIENTE',
    EN_PROCESO = 'EN_PROCESO',
    COMPLETADO = 'COMPLETADO',
    FALLIDO = 'FALLIDO',
    PAUSADO = 'PAUSADO'
}
export enum WsBatchDetailStatus {
    ENVIADO = 'ENVIADO',
    ENTREGADO = 'ENTREGADO',
    FALLIDO = 'FALLIDO',
    PENDIENTE = 'PENDIENTE',
    NO_ENTREGADO = 'NO_ENTREGADO',
}
@Entity('ws_batch_detail')
export class WsBatchDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estado: string;

  @Column({nullable: true})
  error?: string;
}
