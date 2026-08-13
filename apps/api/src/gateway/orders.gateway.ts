import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://web:3000,http://dashboard:3001')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

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
