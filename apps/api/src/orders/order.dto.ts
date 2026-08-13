import { z } from 'zod';

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
    'PENDING_PAYMENT',
    'PAID',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  notes: z.string().max(200).optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
