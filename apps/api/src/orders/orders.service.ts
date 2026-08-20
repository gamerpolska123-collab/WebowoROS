import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersGateway } from '../gateway/orders.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OrderStatus, PaymentStatus, PaymentMethod, DeliveryType, Prisma } from '@prisma/client';

interface CreateOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addons?: { addonId: string; quantity: number }[];
  notes?: string;
}

interface CreateOrderDto {
  items: CreateOrderItem[];
  deliveryType: 'delivery' | 'pickup';
  address?: {
    street: string;
    buildingNumber: string;
    apartmentNumber?: string;
    city: string;
    postalCode: string;
    floor?: string;
    intercom?: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  notes?: string;
  tip?: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private gateway: OrdersGateway,
  ) {}

  async createOrder(userId: string | null, dto: CreateOrderDto, idempotencyKey?: string) {
    // Idempotency check
    if (idempotencyKey) {
      const existing = await this.prisma.order.findFirst({
        where: { idempotencyKey },
        include: { items: { include: { product: true } } },
      });
      if (existing) return existing;
    }

    // Validate products and calculate prices
    let totalAmount = 0;
    const orderItems: { productId: string; variantId?: string; quantity: number; unitPrice: number; notes?: string; addons?: { addonId: string; quantity: number; price: number }[] }[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true, addons: true },
      });

      if (!product || !product.isAvailable) {
        throw new BadRequestException(`Product ${item.productId} not found or unavailable`);
      }

      let unitPrice = Number(product.basePrice);

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant || !variant.isActive) {
          throw new BadRequestException(`Variant ${item.variantId} not found`);
        }
        unitPrice += Number(variant.priceAdjustment);
      }

      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      // Calculate addon prices
      const itemAddons = [];
      if (item.addons) {
        for (const addon of item.addons) {
          const productAddon = product.addons.find((a) => a.id === addon.addonId);
          if (!productAddon || !productAddon.isActive) {
            throw new BadRequestException(`Addon ${addon.addonId} not found`);
          }
          if (addon.quantity > productAddon.maxQuantity) {
            throw new BadRequestException(`Addon ${addon.addonId} exceeds max quantity`);
          }
          const addonPrice = Number(productAddon.price) * addon.quantity;
          totalAmount += addonPrice;
          itemAddons.push({
            addonId: addon.addonId,
            quantity: addon.quantity,
            price: productAddon.price,
          });
        }
      }

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        notes: item.notes,
        addons: itemAddons.map(a => ({ ...a, price: Number(a.price) })),
      });
    }

    // Generate order number
    const orderNumber = `ZAM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate final amount (with tip)
    const tip = Number(dto.tip || 0);
    const finalAmount = totalAmount + tip;

    // Create order within transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.pending_payment,
          totalAmount,
          finalAmount,
          deliveryType: dto.deliveryType,
          address: dto.address ? dto.address as Prisma.InputJsonValue : Prisma.JsonNull,
          contact: dto.contact,
          paymentMethod: dto.paymentMethod as PaymentMethod,
          paymentStatus: PaymentStatus.pending,
          notes: dto.notes,
          tip,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
              addons: item.addons && item.addons.length > 0 ? {
                create: item.addons,
              } : undefined,
            })),
          },
          history: {
            create: {
              status: OrderStatus.pending_payment,
              note: 'Order created, awaiting payment',
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
              addons: true,
            },
          },
          history: true,
        },
      });
      return created;
    });

    // Publish to Redis for real-time updates
    await this.redis.publish('orders:new', JSON.stringify({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
    }));


    // Emit WebSocket events
    this.gateway.server.to('kitchen').emit('kitchen:new', order);
    this.gateway.server.to(`order:${order.id}`).emit('order:updated', order);

    // Create initial status history record
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.status,
        note: 'Order created',
        changedBy: userId || 'system',
      },
    });
    return order;
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
      },
    });
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, changedBy?: string, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending_payment: [OrderStatus.paid, OrderStatus.cancelled],
      paid: [OrderStatus.confirmed, OrderStatus.cancelled],
      confirmed: [OrderStatus.preparing, OrderStatus.cancelled],
      preparing: [OrderStatus.ready_for_pickup, OrderStatus.cancelled],
      ready_for_pickup: [OrderStatus.out_for_delivery, OrderStatus.delivered],
      out_for_delivery: [OrderStatus.delivered, OrderStatus.cancelled],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${newStatus}`
      );
    }

    // Update order with new status and history in transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          history: {
            create: {
              status: newStatus,
              note: note || `Status changed to ${newStatus}`,
              changedBy: changedBy || 'system',
            },
          },
        },
        include: {
          items: { include: { product: true } },
          history: { orderBy: { createdAt: 'desc' } },
        },
      });
      return result;
    });

    // Broadcast status change via WebSocket
    this.gateway?.broadcastOrderStatus(orderId, newStatus, { note, changedBy: changedBy || 'system' });

    // Publish status update to Redis
    await this.redis.publish('order:updates', JSON.stringify({
      orderId: updated.id,
      status: updated.status,
      timestamp: new Date().toISOString(),
    }));

    // Publish to kitchen channel
    if (newStatus === OrderStatus.confirmed || newStatus === OrderStatus.preparing) {
      await this.redis.publish('kitchen:new', JSON.stringify({
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        items: updated.items,
      }));
    }

    return updated;
  }

  /**
   * Cancel order by customer (within 5 minutes of creation)
   */
  
  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, changedBy?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        note: note || `Status changed to ${newStatus}`,
        changedBy: changedBy || 'system',
      },
    });

    this.gateway?.broadcastOrderStatus(orderId, newStatus, { note, changedBy });
    return updated;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, userId: true, createdAt: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    // Allow cancellation only within 5 minutes and if status is PENDING or CONFIRMED
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (order.createdAt < fiveMinutesAgo) {
      throw new BadRequestException('Order can only be cancelled within 5 minutes of creation');
    }

    if (order.status !== OrderStatus.pending_payment && order.status !== OrderStatus.confirmed) {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.cancelled },
    });

    // Create status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.cancelled,
        changedBy: userId,
        note: 'Cancelled by customer',
      },
    });

    // Broadcast via WebSocket
    this.gateway?.broadcastOrderStatus(orderId, OrderStatus.cancelled, { note: 'Cancelled by customer', changedBy: userId });


    // Emit WebSocket events
    this.gateway.server.to(`order:${orderId}`).emit('order:updated', updatedOrder);
    this.gateway.server.to('kitchen').emit('order:updated', updatedOrder);
    return updatedOrder;
  }
  // ─── Cart Methods ───

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, basePrice: true, imageUrl: true },
            },

          },
        },
      },
    });
    return cart || { items: [] };
  }

  async syncCart(userId: string, items: { productId: string; variantId?: string; quantity: number; addons?: { addonId: string; quantity: number }[]; notes?: string }[]) {
    // Upsert cart
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // Clear existing items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Insert new items
    if (items && items.length > 0) {
      await this.prisma.cartItem.createMany({
        data: items.map((item) => ({
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          addons: item.addons || [],
          notes: item.notes || null,
        })),
      });
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
    return { success: true };
  }

}
