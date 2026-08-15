import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Zod Schemas ───

export const OrderItemAddonSchema = z.object({
  addonId: z.string().cuid(),
  quantity: z.number().int().min(1).max(2),
});

export const OrderItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().min(1).max(10),
  addons: z.array(OrderItemAddonSchema).default([]),
  notes: z.string().max(200).optional(),
});

export const AddressSchema = z.object({
  street: z.string().min(1).max(100),
  buildingNumber: z.string().min(1).max(20),
  apartmentNumber: z.string().max(20).optional(),
  city: z.string().min(1).max(50),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/),
  floor: z.string().max(10).optional(),
  intercom: z.string().max(20).optional(),
});

export const ContactSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().regex(/^\d{9}$/),
  email: z.string().email(),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: AddressSchema.optional(),
  contact: ContactSchema,
  paymentMethod: z.enum(['card', 'blik', 'cash_on_delivery']),
  notes: z.string().max(500).optional(),
  tip: z.number().min(0).max(100).optional(),
  appliedPromoIds: z.array(z.string().cuid()).optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'paid',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
  note: z.string().max(200).optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;

// ─── Swagger DTO Classes ───

export class OrderItemAddonDto {
  @ApiProperty({ example: 'clz123abc', description: 'Addon ID' })
  addonId: string;

  @ApiProperty({ example: 1, description: 'Quantity', minimum: 1, maximum: 2 })
  quantity: number;
}

export class OrderItemDto {
  @ApiProperty({ example: 'clz123abc', description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({ example: 'clz456def', description: 'Variant ID (optional)' })
  variantId?: string;

  @ApiProperty({ example: 2, description: 'Quantity', minimum: 1, maximum: 10 })
  quantity: number;

  @ApiPropertyOptional({ type: [OrderItemAddonDto], description: 'Selected addons' })
  addons?: OrderItemAddonDto[];

  @ApiPropertyOptional({ example: 'No onions please', description: 'Item notes' })
  notes?: string;
}

export class AddressDto {
  @ApiProperty({ example: 'Main Street' })
  street: string;

  @ApiProperty({ example: '42' })
  buildingNumber: string;

  @ApiPropertyOptional({ example: '5A' })
  apartmentNumber?: string;

  @ApiProperty({ example: 'Warsaw' })
  city: string;

  @ApiProperty({ example: '00-001', pattern: '^\d{2}-\d{3}$' })
  postalCode: string;

  @ApiPropertyOptional({ example: '3' })
  floor?: string;

  @ApiPropertyOptional({ example: '1234' })
  intercom?: string;
}

export class ContactDto {
  @ApiProperty({ example: 'Jan' })
  firstName: string;

  @ApiProperty({ example: 'Kowalski' })
  lastName: string;

  @ApiProperty({ example: '123456789', pattern: '^\d{9}$' })
  phone: string;

  @ApiProperty({ example: 'jan@example.com' })
  email: string;
}

export class CreateOrderDtoClass {
  @ApiProperty({ type: [OrderItemDto], description: 'Order items' })
  items: OrderItemDto[];

  @ApiProperty({ example: 'delivery', enum: ['delivery', 'pickup'] })
  deliveryType: string;

  @ApiPropertyOptional({ type: AddressDto, description: 'Delivery address (required for delivery)' })
  address?: AddressDto;

  @ApiProperty({ type: ContactDto })
  contact: ContactDto;

  @ApiProperty({ example: 'card', enum: ['card', 'blik', 'cash_on_delivery'] })
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'Ring the bell twice' })
  notes?: string;

  @ApiPropertyOptional({ example: 5.00, description: 'Tip amount' })
  tip?: number;

  @ApiPropertyOptional({ type: [String], description: 'Applied promo IDs' })
  appliedPromoIds?: string[];
}

export class UpdateOrderStatusDtoClass {
  @ApiProperty({
    example: 'confirmed',
    enum: ['pending_payment', 'paid', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'],
    description: 'New order status',
  })
  status: string;

  @ApiPropertyOptional({ example: 'Customer called to confirm' })
  note?: string;
}
