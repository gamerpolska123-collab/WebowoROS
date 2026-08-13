import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, OrderStatus } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: { id: string; email: string; role: string };
}

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() dto: Parameters<OrdersService['createOrder']>[1],
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || null;
    return this.ordersService.createOrder(userId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.kitchen, UserRole.driver, UserRole.admin)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: OrderStatus; note?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.updateStatus(id, dto.status, userId, dto.note);
  }
}
