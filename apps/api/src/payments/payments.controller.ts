import { Controller, Post, Get, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { PaymentsService, SimulatePaymentDto } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const SimulatePaymentSchema = z.object({
  orderId: z.string().cuid(),
  success: z.boolean().optional(),
  method: z.enum(['card', 'blik', 'cash_on_delivery']).optional(),
});

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('simulate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.kitchen)
  @UsePipes(new ZodValidationPipe(SimulatePaymentSchema))
  async simulatePayment(@Body() dto: SimulatePaymentDto) {
    return this.paymentsService.simulatePayment(dto);
  }

  @Get(':orderId/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
