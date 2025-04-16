import { ApiProperty } from '@nestjs/swagger';

class PhoneMessageDto {
  @ApiProperty({
    example: '573001234567',
    description: 'Número de teléfono al que se enviará el mensaje',
  })
  phone: string;

  @ApiProperty({
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
    description: 'UUID del mensaje en la base de datos para este número',
    format: 'uuid',
  })
  messageId: string;
}

export class SendMassiveDto {
  @ApiProperty({
    example: 'Hola a todos',
    description: 'Mensaje que se enviará a todos los números',
  })
  message: string;

  @ApiProperty({
    description: 'Lista de números y sus respectivos IDs de mensaje',
    type: [PhoneMessageDto],
  })
  phones: PhoneMessageDto[];

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...',
    description: 'Archivo en formato base64 que se enviará como adjunto (opcional)',
    required: false,
  })
  fileBase64?: string;
  
  @ApiProperty({
    example: 'image.png',
    description: 'Nombre del archivo (opcional)',
    required: false,
  })
  fileName?: string;

  @ApiProperty({
    example: 'image/png',
    description: 'Tipo MIME del archivo (opcional)',
    required: false,
  })
  fileMimeType?: string;

  @ApiProperty({
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
    description: 'UUID del lote en la base de datos para este lote',
    format: 'uuid',
  })
  bundleId: string;
}
