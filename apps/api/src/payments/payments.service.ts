import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface SimulatePaymentDto {
  orderId: string;
  success?: boolean;
  method?: 'card' | 'blik' | 'cash_on_delivery';
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async simulatePayment(dto: SimulatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.pending_payment) {
      throw new BadRequestException(`Order status is ${order.status}, expected pending_payment`);
    }

    const isSuccess = dto.success !== false; // domyślnie success=true

    if (isSuccess) {
      const updated = await this.prisma.order.update({
        where: { id: dto.orderId },
        data: {
          status: OrderStatus.paid,
          paymentStatus: PaymentStatus.completed,
          paymentMethod: dto.method || order.paymentMethod,
          history: {
            create: {
              status: OrderStatus.paid,
              note: `Payment simulated successfully via ${dto.method || order.paymentMethod}`,
            },
          },
        },
        include: {
          items: { include: { product: true } },
          history: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Publish do Redis (WebSocket + printer)
      await this.redis.publish('orders:new', JSON.stringify({
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        totalAmount: Number(updated.totalAmount),
      }));

      await this.redis.publish('kitchen:new', JSON.stringify({
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        items: updated.items,
      }));

      return {
        success: true,
        order: updated,
        message: 'Payment simulated successfully',
      };
    } else {
      const updated = await this.prisma.order.update({
        where: { id: dto.orderId },
        data: {
          paymentStatus: PaymentStatus.failed,
          history: {
            create: {
              status: order.status,
              note: `Payment simulation failed via ${dto.method || order.paymentMethod}`,
            },
          },
        },
      });

      return {
        success: false,
        order: updated,
        message: 'Payment simulation failed',
      };
    }
  }

  async getPaymentStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        finalAmount: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
