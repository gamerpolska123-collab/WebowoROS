"use client";

import Link from "next/link";
import { useOrders } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Package, Clock, ChevronRight } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending_payment: "Oczekuje płatności",
  paid: "Opłacone",
  confirmed: "Przyjęte",
  preparing: "W przygotowaniu",
  ready_for_pickup: "Gotowe",
  out_for_delivery: "W drodze",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
};

const statusColors: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  preparing: "bg-orange-100 text-orange-700",
  ready_for_pickup: "bg-cyan-100 text-cyan-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function TrackPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-red-600 font-bold">Ładowanie...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Zaloguj się, aby śledzić zamówienia</h1>
          <p className="text-neutral-500 mb-6">Musisz być zalogowany, aby zobaczyć historię zamówień.</p>
          <Link href="/login" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition inline-block">
            Zaloguj się
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
          <Link href="/" className="text-sm font-medium text-red-600 hover:underline">Wróć do strony głównej</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Twoje zamówienia</h1>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Brak zamówień</h2>
            <p className="text-neutral-500 mb-6">Nie złożyłeś jeszcze żadnego zamówienia.</p>
            <Link href="/menu" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition inline-block">
              Zamów teraz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/track/${order.id}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-neutral-900">Zamówienie #{order.id.slice(-6).toUpperCase()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-neutral-100 text-neutral-700"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('pl-PL')}
                      </span>
                      <span>{order.items?.length || 0} pozycji</span>
                      <span className="font-medium text-neutral-900">{order.total?.toFixed(2)} zł</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
