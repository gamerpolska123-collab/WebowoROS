"use client";

import { useState, useCallback } from "react";
import { webApi } from "./api";

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

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateOrderData, retries = 3) => {
    setLoading(true);
    setError(null);

    const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await webApi.createOrder({ ...data, idempotencyKey });
        setLoading(false);
        return result;
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
