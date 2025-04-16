import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { SendSingleDto } from './dto/send-single.dto';
import { SendMassiveDto } from './dto/send-massive.dto';

@ApiTags('Mensajes')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send-single')
  @ApiOperation({ summary: 'Enviar un mensaje individual' })
  @ApiResponse({ status: 200, description: 'Mensaje enviado con éxito' })
  @ApiBody({ type: SendSingleDto })
  async sendSingle(@Body() body: SendSingleDto) {
    await this.messageService.sendSingleMessage(body);
    return { status: 'Message sent successfully!' };
  }

  @Post('send-massive')
  @ApiOperation({ summary: 'Enviar mensajes masivos' })
  @ApiResponse({ status: 200, description: 'Mensajes enviados con éxito' })
  @ApiBody({ type: SendMassiveDto })
  async sendMassive(@Body() body: SendMassiveDto) {
    await this.messageService.sendMassiveMessages(body);
    return { status: 'Messages sent successfully!' };
  }
}
