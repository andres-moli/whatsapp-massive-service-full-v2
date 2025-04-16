import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [WhatsappModule],
})
export class MessageModule {}
