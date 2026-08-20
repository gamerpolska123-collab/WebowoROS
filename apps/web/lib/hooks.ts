'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Category, Product, CreateOrderData, Order } from '@ros/shared-types';

// Retry utility with exponential backoff
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error: any) {
    // Don't retry on client errors (4xx)
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      throw error;
    }
    // Don't retry if no response at all and we've exhausted retries (connection refused)
    if (!error.response && retries <= 1) {
      console.warn('[fetchWithRetry] API connection failed after retries');
      throw error;
    }
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(fetchFn, retries - 1, delay * 2);
  }
}

// ============================================
// MENU
// ============================================

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const { data } = await fetchWithRetry(() => api.get('/menu'));
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // handled by fetchWithRetry
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await fetchWithRetry(() => api.get('/menu/categories'));
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await fetchWithRetry(() => api.get(`/menu/products/${slug}`));
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ============================================
// ORDERS
// ============================================

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await fetchWithRetry(() => api.get('/orders'));
      return data;
    },
    retry: false,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await fetchWithRetry(() => api.get(`/orders/${orderId}`));
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 15000, // Poll every 15s as fallback
    retry: false,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const idempotencyKey = crypto.randomUUID();
      const { data } = await api.post('/orders', orderData, {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.patch(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ============================================
// AUTH
// ============================================

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
