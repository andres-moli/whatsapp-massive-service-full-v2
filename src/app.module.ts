import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { MessageModule } from './message/message.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import config from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        return {
          type: configService.database.type as any, // "postgres"
          host: configService.database.host,
          port: configService.database.port,
          username: configService.database.user,
          password: configService.database.password,
          database: configService.database.name,
          synchronize: false,
          autoLoadEntities: true,
          logging: true,
        };
      },
    }),
    WhatsappModule, MessageModule
  ],
})
export class AppModule {}
