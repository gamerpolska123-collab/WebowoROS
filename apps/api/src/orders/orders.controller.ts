import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { CreateOrderSchema, UpdateOrderStatusSchema, CreateOrderDtoClass, UpdateOrderStatusDtoClass } from './order.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

interface RequestWithUser extends Request {
  user?: { id: string; email: string; role: string };
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order', description: 'Creates a new order (guest or authenticated)' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  async createOrder(
    @Body() dto: CreateOrderDtoClass,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || null;
    return this.ordersService.createOrder(userId, dto as any);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('cookie-auth')
  @ApiOperation({ summary: 'Get order by ID', description: 'Returns order details with items and history' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('cookie-auth')
  @ApiOperation({ summary: 'Get my orders', description: 'Returns all orders for authenticated user' })
  @ApiResponse({ status: 200, description: 'User orders list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.kitchen, UserRole.driver, UserRole.admin)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('cookie-auth')
  @ApiOperation({ summary: 'Update order status', description: 'Changes order status (kitchen/driver/admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  @UsePipes(new ZodValidationPipe(UpdateOrderStatusSchema))
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDtoClass,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.updateStatus(id, dto.status as OrderStatus, userId, dto.note);
  }
}
