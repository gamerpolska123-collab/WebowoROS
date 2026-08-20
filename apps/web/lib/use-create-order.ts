"use client";

import { useState, useCallback } from "react";
import { api } from "./api";

interface Address {
  street: string;
  city: string;
  postalCode: string;
  intercom?: string;
}

interface Contact {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface CreateOrderData {
  items: { productId: string; quantity: number; variantId?: string; addons?: string[] }[];
  deliveryType: string;
  address?: Address;
  contact: Contact;
  notes?: string;
  paymentMethod: string;
  promoCode?: string;
  tip?: number;
}

interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
}

/**
 * Hook do tworzenia zamówień.
 * 
 * Płatność jest realizowana przy odbiorze (gotówka lub karta terminal).
 * Zamówienie po złożeniu ma status 'confirmed' — nie wymaga online płatności.
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateOrderData, retries = 3) => {
    setLoading(true);
    setError(null);

    const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // 1. Utwórz zamówienie
        const orderResponse = await api.post<OrderResponse>("/v1/orders", { ...data, idempotencyKey });
        const order = orderResponse.data;

        setLoading(false);
        return order;
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error("Nieznany błąd");
        if (attempt === retries) {
          setError(err.message);
          setLoading(false);
          throw err;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }, []);

  return { create, loading, error };
}
