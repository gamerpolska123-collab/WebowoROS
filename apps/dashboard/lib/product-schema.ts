import { z } from "zod";

const VariantSchema = z.object({
  name: z.string().min(1, "Nazwa wariantu jest wymagana").max(50),
  priceAdjustment: z.number().min(-100).max(100),
  isActive: z.boolean().default(true),
});

const AddonSchema = z.object({
  name: z.string().min(1, "Nazwa dodatku jest wymagana").max(50),
  price: z.number().min(0).max(100),
  maxQuantity: z.number().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(100),
  description: z.string().min(1, "Opis jest wymagany").max(500),
  basePrice: z.number().min(0, "Cena nie może być ujemna").max(1000),
  imageUrl: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string().min(1, "Kategoria jest wymagana"),
  tags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  variants: z.array(VariantSchema).default([]),
  addons: z.array(AddonSchema).default([]),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
