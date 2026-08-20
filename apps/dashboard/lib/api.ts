"use client";

import type { Order, Product, Category } from "@ros/shared-types";

const API_URL = "/api/v1";

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch(`${API_URL}/auth/csrf`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken || null;
    }
  } catch {
    // ignore
  }
  return csrfToken;
}

function clearCsrfToken() {
  csrfToken = null;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const isMutating = options?.method && !["GET", "HEAD", "OPTIONS"].includes(options.method);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as Record<string, string>,
  };

  if (isMutating) {
    const token = await fetchCsrfToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
    }
  }

  const res = await fetch(url, {
    credentials: "include",
    headers,
    ...options,
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Prevent redirect loop: don't redirect if already on login or forbidden
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/forbidden")) {
        window.location.href = "/login?redirect=" + encodeURIComponent(currentPath);
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const dashApi = {
  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: { id: string; email: string; firstName: string; lastName: string; role: string; phone?: string }; accessToken: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => {
    clearCsrfToken();
    return fetchApi<{ message: string }>("/auth/logout", { method: "POST" });
  },
  me: () => fetchApi<{ id: string; email: string; firstName: string; lastName: string; role: string; phone?: string }>("/auth/me"),

  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    deliveryType?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined) as [string, string][]).toString() : '';
    return fetchApi<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }>(`/admin/orders${qs}`);
  },
  getOrder: (id: string) => fetchApi<Order>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    fetchApi<Order>(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),

  getProducts: () => fetchApi<Product[]>("/admin/products"),
  createProduct: (data: Record<string, unknown>) => fetchApi<Product>("/admin/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Record<string, unknown>) => fetchApi<Product>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => fetchApi<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" }),

  getCategories: () => fetchApi<Category[]>("/admin/categories"),
  createCategory: (data: Record<string, unknown>) => fetchApi<Category>("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Record<string, unknown>) => fetchApi<Category>(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => fetchApi<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" }),

  getStats: () => fetchApi<Record<string, number | string>>("/admin/stats"),

  simulatePayment: (data: { orderId: string; success?: boolean; method?: 'cash_on_delivery' | 'card_on_delivery' }) =>
    fetchApi<{ success: boolean; order: Order; message: string }>("/payments/simulate", { method: "POST", body: JSON.stringify(data) }),
  getPaymentStatus: (orderId: string) => fetchApi<{ status: string; paymentMethod: string }>(`/payments/${orderId}/status`),

  getSalesReport: (period: string = 'daily', days: number = 30) =>
    fetchApi<Record<string, unknown>>(`/admin/reports/sales?period=${period}&days=${days}`),
};
