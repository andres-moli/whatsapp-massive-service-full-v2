import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WsService {
  private server: Server;

  /**
   * Permite establecer el servidor de WebSocket.
   * Se llama desde el Gateway cuando se inicializa.
   */
  setServer(server: Server) {
    this.server = server;
  }

  /**
   * Envía un mensaje a todos los clientes conectados a un canal específico por bundleId.
   * @param bundleId Identificador del grupo de mensajes
   * @param message Mensaje a enviar
   */
  emitLog(bundleId: string, message: string) {
    if (!this.server) return;
    this.server.to(`${bundleId}`).emit('log', { message });
  }
}
