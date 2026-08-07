import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: 'ws',
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers?.authorization;
      const rawToken = client.handshake.auth?.token || client.handshake.query?.token || authHeader;
      if (!rawToken) {
        throw new UnauthorizedException('Missing WebSocket authentication token.');
      }
      const token = typeof rawToken === 'string' && rawToken.startsWith('Bearer ')
        ? rawToken.slice(7)
        : String(rawToken);

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super_secret_jwt_key_benefit_os_production_change_me_32_bytes',
      });
      client.data.user = payload;
      this.logger.log(`Authenticated WebSocket client connected: ${client.id} (user: ${payload.sub})`);

      client.emit('connection_ack', {
        status: 'CONNECTED',
        connectionId: client.id,
        userId: payload.sub,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.warn(`WebSocket authentication failed for client ${client.id}: ${err.message}`);
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication token.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from /ws: ${client.id}`);
  }

  @SubscribeMessage('subscribe_user')
  handleUserSubscription(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const authenticatedUserId = client.data.user?.sub;
    const userRole = client.data.user?.role;

    if (!authenticatedUserId) {
      throw new UnauthorizedException('Unauthenticated socket session.');
    }

    if (data?.userId && (data.userId === authenticatedUserId || ['ADMIN', 'OFFICER'].includes(userRole))) {
      client.join(`user:${data.userId}`);
      this.logger.log(`Socket ${client.id} joined room user:${data.userId}`);
      return { status: 'SUBSCRIBED', room: `user:${data.userId}` };
    } else {
      return { status: 'ERROR', message: 'Forbidden: Cannot subscribe to another user room.' };
    }
  }

  public emitOcrProgress(userId: string, progressData: any) {
    this.server.to(`user:${userId}`).emit('events.ocr_progress', progressData);
  }

  public emitApplicationStatus(userId: string, appData: any) {
    this.server.to(`user:${userId}`).emit('events.application_status_changed', appData);
  }

  public emitNotification(userId: string, notificationData: any) {
    this.server.to(`user:${userId}`).emit('events.notification_received', notificationData);
  }
}
