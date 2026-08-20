"use client";

import type { Order } from "@ros/shared-types";

// Retry utility with exponential backoff
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(fetchFn, retries - 1, delay * 2);
  }
}

import { useState, useEffect, useCallback } from "react";
import { dashApi } from "./api";

export interface OrdersFilters {
  status?: string;
  deliveryType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface OrdersResult {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useOrders(initialFilters?: OrdersFilters) {
  const [result, setResult] = useState<OrdersResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<OrdersFilters>(initialFilters || {});

  const fetch = useCallback(() => {
    setLoading(true);
    dashApi.getOrders({ page, limit, ...filters })
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, limit, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    result,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    setFilters,
    refetch: fetch,
  };
}

export function useProducts() {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashApi.getProducts()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, refetch: () => dashApi.getProducts().then(setData) };
}

export function useCategories() {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashApi.getCategories()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, refetch: () => dashApi.getCategories().then(setData) };
}

export function useStats() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashApi.getStats()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}


export function useSalesReport(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashApi.getSalesReport(period, days)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period, days]);

  return { data, loading, error };
}
