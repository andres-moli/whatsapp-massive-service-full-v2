import { Injectable } from '@nestjs/common';
import { SendMassiveDto } from 'src/message/dto/send-massive.dto';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
// whatsapp.service.ts
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WsBatchDetail, WsBatchDetailStatus, WsBatchStatus } from 'src/entities/ws-batch-detail.entity';
import { WsBatch } from 'src/entities/ws-bundle.entity';

@Injectable()
export class WhatsappService {
  private client: Client;

  constructor(
    @InjectRepository(WsBatchDetail)
    private readonly detailRepo: Repository<WsBatchDetail>,
    @InjectRepository(WsBatch)
    private readonly wsBatchRepo: Repository<WsBatch>,
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
  async sendSingleMessage({ phone, message, messageBase64, fileMimeType, fileName  }: { phone: string; message: string, messageBase64?: string;  fileMimeType?: string; fileName?: string;}): Promise<void> {
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

        await this.client.sendMessage(chatId, media, { caption: message });
      } else {
        await this.client.sendMessage(chatId, message);
      }
      console.log(`Mensaje enviado a ${phone}`);
    } catch (error) {
      throw new Error(`Error al enviar mensaje a ${phone}:` + (error as any)?.["message"]);
      console.error(`Error al enviar mensaje a ${phone}:`, (error as any)?.["message"]);
    }
  }

  // Método para enviar mensajes en bloques de 100, con 10 segundos de espera entre cada bloque
  async sendMassiveMessages(body: SendMassiveDto): Promise<void> {
    const { phones, message } = body;
    const batchSize = 100;
    const subBatchSize = 1;
  
    for (let i = 0; i < phones.length; i += batchSize) {
      const batch = phones.slice(i, i + batchSize);
  
      console.log(`📦 Procesando paquete de ${batch.length} números...`);
  
      for (let j = 0; j < batch.length; j += subBatchSize) {
        const subBatch = batch.slice(j, j + subBatchSize);
  
        for (const phone of subBatch) {
          const numberPhone = phone.phone.replace(/\D/g, ''); // Limpiar el número de teléfono
          try {
            if(body.fileBase64 && body.fileMimeType && body.fileName) {
              await this.sendSingleMessage({ phone: numberPhone, message, messageBase64: body.fileBase64, fileMimeType: body.fileMimeType, fileName: body.fileName });
            }else {
              await this.sendSingleMessage({ phone: numberPhone, message, });
            }
            // ✅ Actualizar estado a 'ENVIADO'
            await this.detailRepo.update(phone.messageId, { estado: WsBatchDetailStatus.ENVIADO, error: null });
          } catch (error) {
            await this.detailRepo.update(phone.messageId, { estado: WsBatchDetailStatus.FALLIDO, error: (error as any)?.["message"] });
          }
        }
  
        if (j + subBatchSize < batch.length) {
          const delay = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000;
          console.log(`⏳ Esperando ${delay / 1000} segundos antes del siguiente mensaje...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
  
      if (i + batchSize < phones.length) {
        console.log(`✅ Paquete de 100 procesado. Continuando con el siguiente lote...`);
      }
    }
    await this.wsBatchRepo.update(body.bundleId, { estado: WsBatchStatus.COMPLETADO });
    console.log(`🎉 Todos los mensajes han sido enviados.`);
  }
  
}
