import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '1234567890', description: 'Phone number in international format without + or @c.us' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'Hello, this is a test message!', description: 'Message to send' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
