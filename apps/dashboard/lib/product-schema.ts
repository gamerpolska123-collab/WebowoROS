import { z } from "zod";

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
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
