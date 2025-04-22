import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Mensajes')
    .setDescription('Documentación de la API para enviar mensajes por WhatsApp')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.useLogger(['error', 'warn']);
  app.use(bodyParser.json({ limit: process.env.FILES_UPLOAD_LIMIT }));
  app.use(
    bodyParser.urlencoded({
      limit: process.env.FILES_UPLOAD_LIMIT,
      extended: true,
    }),
  );
  app.useWebSocketAdapter(new IoAdapter(app)); // Usar el adaptador de socket.io
  await app.listen(3021);
}
bootstrap();
