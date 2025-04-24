import { Injectable } from '@nestjs/common';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SendMassiveDto } from './dto/send-massive.dto';
import { SendSingleDto } from './dto/send-single.dto';

@Injectable()
export class MessageService {
  constructor(private readonly whatsappService: WhatsappService) {}

  async sendMassiveMessages(body: SendMassiveDto) {
    await this.whatsappService.sendMassiveMessages(body);
  }
  async sendSingleMessage(body: SendSingleDto) {
    await this.whatsappService.sendSingleMessage(body);
  }
  async sendMessage(number: string, message: string) {
    await this.whatsappService.sendMessage(number, message);
  }
}
