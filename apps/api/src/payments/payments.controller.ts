import { Controller, Post, Get, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

// ─── Swagger DTO Classes ───

export class SimulatePaymentDtoClass {
  @ApiProperty({ example: 'clz123abc', description: 'Order ID (CUID)' })
  orderId: string;

  @ApiPropertyOptional({ example: true, description: 'Simulate success (default: true)' })
  success?: boolean;

  @ApiPropertyOptional({ example: 'card', enum: ['card', 'blik', 'cash_on_delivery'], description: 'Payment method override' })
  method?: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ example: 'clz123abc' })
  id: string;

  @ApiProperty({ example: 'ORD-2024-001' })
  orderNumber: string;

  @ApiProperty({ example: 'paid', enum: ['pending_payment', 'paid', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'] })
  status: string;

  @ApiProperty({ example: 'completed', enum: ['pending', 'completed', 'failed', 'refunded'] })
  paymentStatus: string;

  @ApiProperty({ example: 'card', enum: ['card', 'blik', 'cash_on_delivery'] })
  paymentMethod: string;

  @ApiProperty({ example: 89.5 })
  finalAmount: number;
}

export class SimulatePaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => Object, description: 'Updated order object' })
  order: any;

  @ApiProperty({ example: 'Payment simulated successfully' })
  message: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('simulate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.kitchen)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('cookie-auth')
  @ApiOperation({ summary: 'Simulate payment', description: 'Simulates a payment for testing purposes. Requires admin or kitchen role.' })
  @ApiResponse({ status: 200, description: 'Payment simulated', type: SimulatePaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Order status is not pending_payment' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin or kitchen only' })
  @UsePipes(new ZodValidationPipe(SimulatePaymentSchema))
  async simulatePayment(@Body() dto: SimulatePaymentDtoClass) {
    return this.paymentsService.simulatePayment(dto as SimulatePaymentDto);
  }

  @Get(':orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('cookie-auth')
  @ApiOperation({ summary: 'Get payment status', description: 'Returns payment status for a given order' })
  @ApiParam({ name: 'orderId', example: 'clz123abc', description: 'Order ID (CUID)' })
  @ApiResponse({ status: 200, description: 'Payment status', type: PaymentStatusResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
