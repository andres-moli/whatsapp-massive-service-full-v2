// src/ws/repositories/ws-batch-log.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { WsBatchLog } from '../entities/ws-batch-log.entity';

@EntityRepository(WsBatchLog)
export class WsBatchLogRepository extends Repository<WsBatchLog> {
  async saveLog(bundleId: string, log: any): Promise<void> {
    await this.save({ bundleId, log });
  }
}
