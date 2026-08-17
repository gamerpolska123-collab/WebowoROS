"use client";

import { Category, Product, Order, OrderStatus } from "@ros/shared-types";

// Use NEXT_PUBLIC_API_URL env var (set in Docker to http://api:4000/v1 or via Nginx)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api:4000/v1";

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

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  getMenu: () => fetchApi<Category[]>("/menu"),
  getProduct: (id: string) => fetchApi<Product>(`/products/${id}`),

  register: (data: { email: string; phone: string; password: string; firstName: string; lastName: string }) =>
    fetchApi<{ user: any; message: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: any; accessToken: string; refreshToken: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => {
    clearCsrfToken();
    return fetchApi<{ message: string }>("/auth/logout", { method: "POST" });
  },

  createOrder: (data: any) => fetchApi<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrder: (id: string) => fetchApi<Order>(`/orders/${id}`),
  getMyOrders: () => fetchApi<Order[]>("/orders/my"),

  getProducts: () => fetchApi<Product[]>("/admin/products"),
  getCategories: () => fetchApi<Category[]>("/admin/categories"),
};
