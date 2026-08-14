import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://web:3000,http://dashboard:3001')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

@Injectable()
@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  constructor(private redisService: RedisService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    this.subscribeToRedis();
  }

  private async subscribeToRedis() {
    // Subskrypcja nowych zamówień
    await this.redisService.subscribe('orders:new', (message) => {
      try {
        const data = JSON.parse(message);
        this.server.to('kitchen').emit('orders:new', data);
        this.logger.debug(`Emitted orders:new for order ${data.orderId}`);
      } catch (e) {
        this.logger.error('Failed to parse orders:new message', e);
      }
    });

    // Subskrypcja aktualizacji statusu zamówień
    await this.redisService.subscribe('order:updates', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.orderId) {
          this.server.to(`order:${data.orderId}`).emit('order:updated', data);
        }
      } catch (e) {
        this.logger.error('Failed to parse order update message', e);
      }
    });

    // Subskrypcja kuchni
    await this.redisService.subscribe('kitchen:new', (message) => {
      try {
        const data = JSON.parse(message);
        this.server.to('kitchen').emit('kitchen:new', data);
      } catch (e) {
        this.logger.error('Failed to parse kitchen:new message', e);
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_order')
  handleJoinOrder(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    this.logger.log(`Client ${client.id} joined order:${orderId}`);
    client.emit('joined', { orderId, message: 'Subscribed to order updates' });
  }

  @SubscribeMessage('leave_order')
  handleLeaveOrder(client: Socket, orderId: string) {
    client.leave(`order:${orderId}`);
    this.logger.log(`Client ${client.id} left order:${orderId}`);
  }

  @SubscribeMessage('join_kitchen')
  handleJoinKitchen(client: Socket) {
    client.join('kitchen');
    this.logger.log(`Client ${client.id} joined kitchen`);
    client.emit('joined', { room: 'kitchen', message: 'Subscribed to kitchen updates' });
  }

  @SubscribeMessage('join_driver')
  handleJoinDriver(client: Socket, driverId: string) {
    client.join(`driver:${driverId}`);
    this.logger.log(`Client ${client.id} joined driver:${driverId}`);
    client.emit('joined', { driverId, message: 'Subscribed to driver updates' });
  }

  emitOrderStatus(orderId: string, status: string, data?: any) {
    this.server.to(`order:${orderId}`).emit('order_status_changed', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  emitNewOrderToKitchen(orderData: any) {
    this.server.to('kitchen').emit('new_order', orderData);
  }

  emitDeliveryAssignment(driverId: string, orderData: any) {
    this.server.to(`driver:${driverId}`).emit('delivery_assigned', orderData);
  }
}
