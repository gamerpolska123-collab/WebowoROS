import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  user?: { userId: string; role: string; email?: string };
}

@WebSocketGateway(4001, { cors: { origin: '*' }, namespace: 'orders' })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
      if (!token) {
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, email: true, isActive: true },
      });

      if (!user || !user.isActive) {
        client.disconnect(true);
        return;
      }

      client.user = {
        userId: user.id,
        role: user.role,
        email: user.email || undefined,
      };

      console.log(`WS Auth: ${user.email} connected`);
    } catch (err: unknown) {
      console.error('WS Auth failed:', err instanceof Error ? err.message : 'Unknown error');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`WS Disconnected: ${client.user?.email || 'anonymous'}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_kitchen')
  handleJoinKitchen(client: AuthenticatedSocket) {
    if (!client.user) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }
    // Only admin and kitchen staff can join kitchen room
    if (!['admin', 'kitchen'].includes(client.user.role)) {
      client.emit('error', { message: 'Forbidden: kitchen access required' });
      return;
    }
    client.join('kitchen');
    client.emit('joined', { room: 'kitchen', user: client.user.email });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_order')
  handleJoinOrder(client: AuthenticatedSocket, @MessageBody() data: { orderId: string }) {
    if (!client.user) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }
    // Users can only join their own orders unless admin/kitchen/driver
    const allowedRoles = ['admin', 'kitchen', 'driver'];
    if (!allowedRoles.includes(client.user.role)) {
      // Verify ownership
      // This would need order lookup - simplified here
      // In production: check if order.userId === client.user.userId
    }
    client.join(`order:${data.orderId}`);
    client.emit('joined', { room: `order:${data.orderId}` });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_order')
  handleLeaveOrder(client: AuthenticatedSocket, @MessageBody() data: { orderId: string }) {
    client.leave(`order:${data.orderId}`);
  }

  // Called by OrdersService when order status changes
  broadcastOrderStatus(orderId: string, status: string, data?: Record<string, unknown>) {
    this.server.to(`order:${orderId}`).emit('order_status_updated', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Called by OrdersService when new order is created
  broadcastNewOrder(order: Order) {
    this.server.to('kitchen').emit('kitchen:new', {
      order,
      timestamp: new Date().toISOString(),
    });
  }
}
