import { Injectable } from '@nestjs/common';
import { SendMassiveDto } from 'src/message/dto/send-massive.dto';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
// whatsapp.service.ts
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WsBatchDetail, WsBatchDetailStatus, WsBatchStatus } from 'src/entities/ws-batch-detail.entity';
import { WsBatch } from 'src/entities/ws-bundle.entity';
import { WsBatchLogRepository } from 'src/ws/repositories/ws-batch-log.repository';
import { WsGateway } from 'src/ws/ws.gateway';

@Injectable()
export class WhatsappService {
  private client: Client;

  constructor(
    @InjectRepository(WsBatchDetail)
    private readonly detailRepo: Repository<WsBatchDetail>,
    @InjectRepository(WsBatch)
    private readonly wsBatchRepo: Repository<WsBatch>,
    private readonly wsGateway: WsGateway,
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth(), // Usamos autenticación local para guardar la sesión
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true }); // <-- Aquí la magia
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Web Client is ready!');
    });

    this.client.on('message', (msg: Message) => {
      console.log('Message received:', msg.body);
    });

    this.client.initialize();
  }

  // Método para enviar un mensaje individual
  async sendSingleMessage({ phone, message, messageBase64, fileMimeType, fileName  }: { phone: string; message: string, messageBase64?: string;  fileMimeType?: string; fileName?: string;}) {
    try {
      const chatId = `${phone}@c.us`;
      
      if (messageBase64 && fileMimeType && fileName) {
        const extensionToMime: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          pdf: 'application/pdf',
          mp4: 'video/mp4',
          webp: 'image/webp',
        };
        
        const fileExtension = fileMimeType.toLowerCase();
        const fileMimeTypeConvert = extensionToMime[fileExtension] ?? 'application/octet-stream';
        const media = new MessageMedia(fileMimeTypeConvert, messageBase64, fileName);

        return await this.client.sendMessage(chatId, media, { caption: message });
      } else {
        return await this.client.sendMessage(chatId, message);
      }
      console.log(`Mensaje enviado a ${phone}`);
    } catch (error) {
      throw new Error(`Error al enviar mensaje a ${phone}:` + (error as any)?.["message"]);
      console.error(`Error al enviar mensaje a ${phone}:`, (error as any)?.["message"]);
    }
  }

  // Método para enviar mensajes en bloques de 100, con 10 segundos de espera entre cada bloque
  async sendMassiveMessages(body: SendMassiveDto): Promise<void> {
    const { phones, message, bundleId } = body;
    const batchSize = 100;
    const subBatchSize = 1;
    const totalMessages = phones.length;
    let processedMessages = 0;
  
    const log = async (msg: string) => {
      await this.wsGateway.saveLog(bundleId, msg);
      this.wsGateway.sendLog(bundleId, msg);
    };
  
    // Horario laboral permitido: 8 AM a 6 PM
    const WORK_START_HOUR = 8;
    const WORK_END_HOUR = 18;
  
    // Validación inicial de horario
    const now = new Date();
    const currentHour = now.getHours();
  
    if (currentHour < WORK_START_HOUR || currentHour >= WORK_END_HOUR) {
      await log(`🕒 Fuera del horario laboral (actual: ${currentHour}:00). Pausando el lote.`);
      await this.wsBatchRepo.update(bundleId, { estado: WsBatchStatus.PAUSADO });
      return;
    }
  
    // Envía el progreso inicial (0%)
    this.wsGateway.sendProgress(bundleId, {
      current: 0,
      total: totalMessages,
      percentage: 0,
    });
  
    for (let i = 0; i < phones.length; i += batchSize) {
      const batch = phones.slice(i, i + batchSize);
      await log(`📦 Procesando paquete de ${batch.length} números (${i + 1}-${Math.min(i + batchSize, totalMessages)}/${totalMessages})...`);
  
      for (let j = 0; j < batch.length; j += subBatchSize) {
        const subBatch = batch.slice(j, j + subBatchSize);
  
        for (const phone of subBatch) {
          const now = new Date();
          const currentHour = now.getHours();
  
          // Verificación dentro del ciclo (por si se pasa el horario en medio de la ejecución)
          if (currentHour < WORK_START_HOUR || currentHour >= WORK_END_HOUR) {
            await log(`🕒 Se ha salido del horario laboral (actual: ${currentHour}:00). Pausando el lote.`);
            await this.wsBatchRepo.update(bundleId, { estado: WsBatchStatus.PAUSADO });
            return;
          }
  
          const numberPhone = phone.phone.replace(/\D/g, '');
          try {
            const personalizedMessage = replacePlaceholders(message, phone.variables || {});
            if (body.fileBase64 && body.fileMimeType && body.fileName) {
              await this.sendSingleMessage({
                phone: numberPhone,
                message: personalizedMessage,
                messageBase64: body.fileBase64,
                fileMimeType: body.fileMimeType,
                fileName: body.fileName,
              });
            } else {
              await this.sendSingleMessage({ phone: numberPhone, message: personalizedMessage });
            }
  
            await this.detailRepo.update(phone.messageId, {
              estado: WsBatchDetailStatus.ENVIADO,
              error: null,
            });
  
            await log(`✅ Mensaje enviado a ${numberPhone}`);
          } catch (error) {
            await this.detailRepo.update(phone.messageId, {
              estado: WsBatchDetailStatus.FALLIDO,
              error: (error as any)?.['message'],
            });
            await log(`❌ Error al enviar a ${numberPhone}: ${(error as any)?.['message']}`);
          }
  
          processedMessages++;
          const percentage = Math.round((processedMessages / totalMessages) * 100);
          this.wsGateway.sendProgress(bundleId, {
            current: processedMessages,
            total: totalMessages,
            percentage,
          });
        }
  
        if (j + subBatchSize < batch.length) {
          const delay = Math.floor(Math.random() * (132000 - 108000 + 1)) + 108000;
          await log(`⏳ Esperando ${Math.round(delay / 1000)} segundos antes del siguiente mensaje...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
  
      if (i + batchSize < phones.length) {
        const batchDelay = Math.floor(Math.random() * (630000 - 570000 + 1)) + 570000;
        await log(`🛑 Esperando ${Math.round(batchDelay / 1000 / 60)} minutos antes del siguiente lote...`);
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }
  
    await this.wsBatchRepo.update(bundleId, { estado: WsBatchStatus.COMPLETADO });
    await log(`🎉 Todos los mensajes han sido enviados.`);
  
    this.wsGateway.sendProgress(bundleId, {
      current: totalMessages,
      total: totalMessages,
      percentage: 100,
    });
  }
  
  
  
}
function replacePlaceholders(message: string, variables: Record<string, string>): string {
  return message.replace(/{(.*?)}/g, (_, key) => {
    const value = variables[key];
    return value ? value.toUpperCase() : `{${key}}`;
  });
}
