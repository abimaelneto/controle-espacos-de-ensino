import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeEventsGateway.name);
  private connectedClients = new Set<string>();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
    
    // Enviar confirmação de conexão
    client.emit('connected', {
      message: 'Connected to realtime updates',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { rooms?: string[] }) {
    this.logger.log(`Client ${client.id} subscribed to rooms: ${payload.rooms?.join(', ') || 'all'}`);
    
    // Adicionar cliente a rooms específicas se fornecido
    if (payload.rooms && payload.rooms.length > 0) {
      payload.rooms.forEach((roomId) => {
        client.join(`room:${roomId}`);
      });
    }
    
    client.emit('subscribed', {
      rooms: payload.rooms || 'all',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { rooms?: string[] }) {
    this.logger.log(`Client ${client.id} unsubscribed from rooms: ${payload.rooms?.join(', ') || 'all'}`);
    
    if (payload.rooms && payload.rooms.length > 0) {
      payload.rooms.forEach((roomId) => {
        client.leave(`room:${roomId}`);
      });
    }
    
    client.emit('unsubscribed', {
      rooms: payload.rooms || 'all',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notificar todos os clientes sobre um novo check-in
   */
  broadcastCheckIn(data: {
    roomId: string;
    studentId: string;
    attendanceId: string;
    checkInTime: string;
  }) {
    this.logger.debug(`Broadcasting check-in: ${data.attendanceId} in room ${data.roomId}`);
    
    // Enviar para todos os clientes
    this.server.emit('checkin', {
      type: 'checkin',
      data,
      timestamp: new Date().toISOString(),
    });

    // Enviar também para clientes específicos da sala
    this.server.to(`room:${data.roomId}`).emit('room:checkin', {
      type: 'room:checkin',
      roomId: data.roomId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notificar todos os clientes sobre um checkout
   */
  broadcastCheckOut(data: {
    roomId: string;
    studentId: string;
    attendanceId: string;
    checkInTime: string;
    checkOutTime: string;
  }) {
    this.logger.debug(`Broadcasting check-out: ${data.attendanceId} from room ${data.roomId}`);
    
    // Enviar para todos os clientes
    this.server.emit('checkout', {
      type: 'checkout',
      data,
      timestamp: new Date().toISOString(),
    });

    // Enviar também para clientes específicos da sala
    this.server.to(`room:${data.roomId}`).emit('room:checkout', {
      type: 'room:checkout',
      roomId: data.roomId,
      data,
      timestamp: new Date().toISOString(),
    });

    // Notificar atualização de ocupação (checkout reduz ocupação)
    this.server.emit('occupancy:update', {
      type: 'occupancy:update',
      data: {
        roomId: data.roomId,
        action: 'CHECK_OUT',
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notificar atualização de ocupação de uma sala
   */
  broadcastRoomOccupancyUpdate(data: {
    roomId: string;
    occupancy: number;
    checkInsLast15Minutes: number;
    checkInsLastHour: number;
  }) {
    this.logger.debug(`Broadcasting occupancy update for room ${data.roomId}`);
    
    // Enviar para clientes específicos da sala
    this.server.to(`room:${data.roomId}`).emit('room:occupancy', {
      type: 'room:occupancy',
      roomId: data.roomId,
      data,
      timestamp: new Date().toISOString(),
    });

    // Enviar também para todos (para atualizar dashboard geral)
    this.server.emit('occupancy:update', {
      type: 'occupancy:update',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notificar atualização de estatísticas do dashboard
   */
  broadcastDashboardUpdate(data: {
    totalCheckins: number;
    activeCheckins: number;
    roomsOccupied: number;
    studentsActive: number;
  }) {
    this.logger.debug('Broadcasting dashboard update');
    
    this.server.emit('dashboard:update', {
      type: 'dashboard:update',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

