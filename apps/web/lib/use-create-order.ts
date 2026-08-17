"use client";

import { useState, useCallback } from "react";
import { api } from "./api";

interface CreateOrderData {
  items: { productId: string; quantity: number; variantId?: string; addons?: string[] }[];
  deliveryType: string;
  address?: any;
  contact: any;
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
 * Hook do tworzenia zamówień z automatyczną obsługą płatności (DEV).
 * 
 * Dla paymentMethod === 'card' lub 'blik' — automatycznie wywołuje symulator
 * płatności, który natychmiast oznacza zamówienie jako opłacone.
 * 
 * Dla 'cash_on_delivery' — pomija symulator (płatność przy odbiorze).
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

        // 2. DEV: Automatycznie przetwórz płatność dla karty / BLIK (symulator)
        if (data.paymentMethod === "card" || data.paymentMethod === "blik") {
          try {
            await api.post("/v1/payments/simulate", {
              orderId: order.id,
              success: true,
              method: data.paymentMethod,
            });
            // Lokalna aktualizacja stanu po udanej płatności
            order.status = "confirmed";
            order.paymentStatus = "completed";
          } catch (paymentErr: any) {
            // Symulator nie powiódł się, ale zamówienie zostało utworzone
            console.warn("[DEV] Symulator płatności nie powiódł się:", paymentErr.message);
            // Zamówienie pozostaje w statusie pending_payment — nie tracimy go
          }
        }

        setLoading(false);
        return order;
      } catch (e: any) {
        if (attempt === retries) {
          setError(e.message);
          setLoading(false);
          throw e;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }, []);

  return { create, loading, error };
}
