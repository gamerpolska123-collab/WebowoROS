import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.DASHBOARD_URL || 'http://localhost:3001',
    ],
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

  // Method to emit order status updates
  emitOrderStatus(orderId: string, status: string, data?: any) {
    this.server.to(`order:${orderId}`).emit('order_status_changed', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Method to emit new orders to kitchen
  emitNewOrderToKitchen(orderData: any) {
    this.server.to('kitchen').emit('new_order', orderData);
  }

  // Method to emit delivery assignment
  emitDeliveryAssignment(driverId: string, orderData: any) {
    this.server.to(`driver:${driverId}`).emit('delivery_assigned', orderData);
  }
}
