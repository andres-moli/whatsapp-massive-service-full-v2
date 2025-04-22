import { ApiProperty } from '@nestjs/swagger';

class PhoneMessageDto {
  @ApiProperty({
    example: '573001234567',
    description: 'Número de teléfono al que se enviará el mensaje',
  })
  phone: string;
  @ApiProperty({
    example: 'ANDRES',
    description: 'Nomrbe de teléfono al que se enviará el mensaje',
    required: false,
  })
  name?: string;
  @ApiProperty({
    example: { nombre: 'Andrés', producto: 'Laptop', fecha: '2024-04-21' },
    description: 'Diccionario de variables para personalizar el mensaje',
    required: false,
  })
  variables?: Record<string, string>;

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
