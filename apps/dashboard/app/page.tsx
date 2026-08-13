"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useOrders, useStats } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { Package, ChefHat, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

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

export default function DashboardHomePage() {
  const { user, isAdmin, logout } = useAuth();
  const { data: orders, loading: ordersLoading, refetch } = useOrders();
  const { data: stats, loading: statsLoading } = useStats();
  const [wsStatus, setWsStatus] = useState("connecting");

  // WebSocket for real-time orders
  useEffect(() => {
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://api:4001").replace("http://", "ws://").replace("https://", "wss://");
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      setWsStatus("connected");
      ws.send(JSON.stringify({ event: "join_kitchen" }));
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "kitchen:new" || msg.event === "order_status_updated") {
          refetch();
        }
      } catch {}
    };
    ws.onclose = () => setWsStatus("disconnected");
    return () => ws.close();
  }, [refetch]);

  const recentOrders = orders?.slice(0, 5) || [];

  const statCards = [
    { label: "Dzisiejsze zamówienia", value: stats?.todayOrders ?? 0, icon: <Package className="w-5 h-5" />, color: "bg-blue-500" },
    { label: "Przychód dzisiaj", value: `${(stats?.todayRevenue ?? 0).toFixed(2)} zł`, icon: <DollarSign className="w-5 h-5" />, color: "bg-green-500" },
    { label: "W przygotowaniu", value: stats?.preparingOrders ?? 0, icon: <ChefHat className="w-5 h-5" />, color: "bg-orange-500" },
    { label: "Oczekujące", value: stats?.pendingOrders ?? 0, icon: <Clock className="w-5 h-5" />, color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-neutral-900 text-white min-h-screen fixed left-0 top-0 flex flex-col">
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-xl font-black text-red-500 tracking-tight">WebowoROS</h1>
            <p className="text-xs text-neutral-400 mt-1">Panel administracyjny</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/20 text-red-400 font-medium">
              <TrendingUp className="w-5 h-5" /> Przegląd
            </Link>
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition font-medium">
              <Package className="w-5 h-5" /> Zamówienia
            </Link>
            <Link href="/kds" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition font-medium">
              <ChefHat className="w-5 h-5" /> KDS
            </Link>
            <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition font-medium">
              <Package className="w-5 h-5" /> Produkty
            </Link>
          </nav>
          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full py-2 text-sm text-neutral-400 hover:text-white transition">
              Wyloguj
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Przegląd</h2>
              <p className="text-neutral-500">Witaj z powrotem, {user?.firstName}!</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-500" : "bg-amber-500"}`} />
              <span className="text-xs text-neutral-400">
                {wsStatus === "connected" ? "Online" : "Łączenie..."}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center mb-3`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-black text-neutral-900">{card.value}</p>
                <p className="text-sm text-neutral-500">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Ostatnie zamówienia</h3>
              <Link href="/orders" className="text-sm font-medium text-red-600 hover:underline">
                Zobacz wszystkie →
              </Link>
            </div>
            {ordersLoading ? (
              <div className="p-8 text-center text-neutral-400">Ładowanie zamówień...</div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">Brak zamówień</div>
            ) : (
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Numer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Klient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Wartość</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition">
                      <td className="px-6 py-4 font-medium text-neutral-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-neutral-600">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Gość"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                          {order.status === "delivered" ? <CheckCircle className="w-3 h-3" /> : order.status === "cancelled" ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">{Number(order.finalAmount).toFixed(2)} zł</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {new Date(order.createdAt).toLocaleString("pl-PL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
