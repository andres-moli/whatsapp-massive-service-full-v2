import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WsBatchDetail } from 'src/entities/ws-batch-detail.entity';
import { WsBatch } from 'src/entities/ws-bundle.entity';

@Module({
  providers: [WhatsappService],
  exports: [WhatsappService],
  imports: [TypeOrmModule.forFeature([WsBatchDetail,WsBatch])]
})
export class WhatsappModule {}
