"use client";

import { z } from "zod";

export const checkoutSchema = z.object({
  deliveryType: z.enum(["delivery", "pickup"]),
  firstName: z.string().min(2, "Imię jest wymagane"),
  lastName: z.string().min(2, "Nazwisko jest wymagane"),
  phone: z.string().regex(/^\+?[0-9\s-]{9,}$/, "Nieprawidłowy numer telefonu"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
  street: z.string().min(3, "Ulica jest wymagana").optional(),
  buildingNumber: z.string().min(1, "Numer budynku jest wymagany").optional(),
  apartmentNumber: z.string().optional(),
  city: z.string().min(2, "Miasto jest wymagane").optional(),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format: XX-XXX").optional(),
  floor: z.string().optional(),
  intercom: z.string().optional(),
  paymentMethod: z.enum(["online", "cash", "card_on_delivery"]),
  notes: z.string().optional(),
  tip: z.coerce.number().min(0).max(100).optional(),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
