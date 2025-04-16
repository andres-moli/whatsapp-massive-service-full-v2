import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WsBatchStatus } from './ws-batch-detail.entity';

@Entity({ name: 'ws_batch' })
export class WsBatch  {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  error?: string;

  @Column()
  estado: WsBatchStatus;

}
