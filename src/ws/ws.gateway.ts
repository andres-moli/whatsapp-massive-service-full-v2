import {
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { WsService } from './ws.service';
import { InjectRepository } from '@nestjs/typeorm';
import { WsBatchLogRepository } from './repositories/ws-batch-log.repository';
  
  @WebSocketGateway({
    namespace: 'ws',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
    transports: ['websocket'],
  
  })
  export class WsGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private readonly wsService: WsService,
      @InjectRepository(WsBatchLogRepository)
      private readonly wsBatchLogRepo: WsBatchLogRepository,
    ) {}
  
    afterInit(server: Server) {
      this.wsService.setServer(server);
      console.log('Server initialized');
      this.server = server; // Verifica que this.server se está inicializando correctamente.
    }
    
  
    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, data: { bundleId: string }) {
      const { bundleId } = data;
      console.log("Cliente:", client.id, "solicita suscripción a:", bundleId);
      
      if (!bundleId) {
        console.error("BundleId no proporcionado");
        return;
      }
      
      client.join(bundleId);
      console.log(`Cliente ${client.id} unido a la sala ${bundleId}`);
    }
    sendLog(bundleId: string, message: string) {
      console.log('Enviando log al cliente:', bundleId, message); 
      this.server.to(bundleId).emit('log', { message });
    }
    sendProgress(bundleId: string, progress: { current: number; total: number; percentage: number }) {
      console.log('Enviando progreso:', progress);
      this.server.to(bundleId).emit('progress', progress);
    }
    async saveLog(bundleId: string, msg: string) {
      //await this.wsBatchLogRepo.saveLog(bundleId, { timestamp: new Date(), message: msg });
    }   
    handleConnection(client: Socket) {
      console.log(`Cliente conectado: ${client.id}`);
      // Aquí puedes verificar el query parameter bundleId si lo necesitas
      const { bundleId } = client.handshake.query;
      console.log('BundleId desde query:', bundleId);
    }
  }
  