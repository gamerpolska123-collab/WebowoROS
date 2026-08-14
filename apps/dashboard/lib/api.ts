"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api:4000/v1";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const dashApi = {
  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: any; accessToken: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => fetchApi<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => fetchApi<{ id: string; email: string; firstName: string; lastName: string; role: string }>("/auth/me"),

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
    return fetchApi<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>(`/admin/orders${qs}`);
  },
  getOrder: (id: string) => fetchApi<any>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    fetchApi<any>(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),

  getProducts: () => fetchApi<any[]>("/admin/products"),
  createProduct: (data: any) => fetchApi<any>("/admin/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => fetchApi<any>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => fetchApi<any>(`/admin/products/${id}`, { method: "DELETE" }),

  getCategories: () => fetchApi<any[]>("/admin/categories"),
  createCategory: (data: any) => fetchApi<any>("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => fetchApi<any>(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => fetchApi<any>(`/admin/categories/${id}`, { method: "DELETE" }),

  getStats: () => fetchApi<any>("/admin/stats"),

  // Payments (symulator)
  simulatePayment: (data: { orderId: string; success?: boolean; method?: 'card' | 'blik' | 'cash_on_delivery' }) =>
    fetchApi<{ success: boolean; order: any; message: string }>("/payments/simulate", { method: "POST", body: JSON.stringify(data) }),
  getPaymentStatus: (orderId: string) => fetchApi<any>(`/payments/${orderId}/status`),
};
