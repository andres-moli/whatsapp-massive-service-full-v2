import { ApiProperty } from '@nestjs/swagger';

export class SendSingleDto {
  @ApiProperty({ example: '573001234567', description: 'Número de teléfono en formato internacional' })
  phone: string;

  @ApiProperty({ example: 'Hola, ¿cómo estás?', description: 'Mensaje a enviar' })
  message: string;
}
