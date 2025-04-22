import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WsGateway } from './ws.gateway';
import { WsBatchLogRepository } from './repositories/ws-batch-log.repository';
import { WsService } from './ws.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WsBatchLogRepository,
      WsBatchLogRepository,
    ]),
  ],
  providers: [WsGateway, WsService],
  exports: [WsService,WsGateway],
})
export class WsModule {}
