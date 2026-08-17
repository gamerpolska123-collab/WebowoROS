"use client";
import DashboardShell from "@/components/dashboard-shell";

import { useState, useCallback } from "react";
import { Card, CardContent, Button } from "@ros/ui";
import { useOrders } from "@/lib/hooks";
import { useOrdersWebSocket } from "@/lib/use-orders-ws";
import { dashApi } from "@/lib/api";
import { OrderFilters } from "./components/order-filters";
import { OrdersTable } from "./components/orders-table";
import { OrderDetailModal } from "./components/order-detail-modal";
import { OrdersPagination } from "./components/orders-pagination";

export default function OrdersPage() {
  const {
    result,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    setFilters,
    refetch,
  } = useOrders();

  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [optimisticOrders, setOptimisticOrders] = useState<any[] | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // WebSocket auto-refresh
  useOrdersWebSocket(refetch);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    setUpdatingId(id);
    // Optimistic update
    if (result?.data) {
      setOptimisticOrders(result.data.map((o: any) => o.id === id ? { ...o, status } : o));
    }
    try {
      await dashApi.updateOrderStatus(id, status);
      setOptimisticOrders(null);
      refetch();
    } catch (e: any) {
      setOptimisticOrders(null);
      alert("Błąd: " + e.message);
    } finally {
      setUpdatingId(null);
    }
  }, [refetch, result]);

  const handleCancel = useCallback(async (id: string) => {
    if (!confirm("Czy na pewno chcesz anulować to zamówienie?")) return;
    setUpdatingId(id);
    try {
      await dashApi.updateOrderStatus(id, "cancelled", "Anulowane z panelu");
      refetch();
    } catch (e: any) {
      alert("Błąd: " + e.message);
    } finally {
      setUpdatingId(null);
    }
  }, [refetch]);

  const handleSimulatePayment = useCallback(async (id: string) => {
    setSimulatingId(id);
    try {
      const res = await dashApi.simulatePayment({ orderId: id, success: true });
      alert(res.message);
      refetch();
    } catch (e: any) {
      alert("Błąd symulacji: " + e.message);
    } finally {
      setSimulatingId(null);
    }
  }, [refetch]);

  const handleView = useCallback((order: any) => {
    setDetailOrder(order);
    setDetailOpen(true);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, [setFilters, setPage]);

  return (
      <DashboardShell>
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">📦 Zamówienia</h2>
        <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
          {loading ? "Ładowanie..." : "🔄 Odśwież"}
        </Button>
      </div>

      <OrderFilters filters={filters} onChange={setFilters} onReset={handleReset} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Błąd: {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading && !result ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
            </div>
          ) : (
            <OrdersTable
              orders={optimisticOrders || result?.data || []}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
              onView={handleView}
              onSimulatePayment={handleSimulatePayment}
            updatingId={updatingId}
            simulatingId={simulatingId}
            />
          )}
        </CardContent>
      </Card>

      {result && result.totalPages > 1 && (
        <OrdersPagination
          page={page}
          totalPages={result.totalPages}
          total={result.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      )}

      <OrderDetailModal
        order={detailOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
      </DashboardShell>
    );
}
