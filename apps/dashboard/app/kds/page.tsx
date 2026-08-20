"use client";
import DashboardShell from "@/components/dashboard-shell";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useOrders } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import type { Socket } from "socket.io-client";
import { dashApi } from "@/lib/api";
import { Clock, ChefHat, Package, Truck, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const statusFlow = ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered"];
const statusLabels: Record<string, string> = {
  confirmed: "Przyjęte",
  preparing: "W przygotowaniu",
  ready_for_pickup: "Gotowe",
  out_for_delivery: "W drodze",
  delivered: "Dostarczone",
};
const statusColors: Record<string, string> = {
  confirmed: "border-purple-400 bg-purple-50",
  preparing: "border-orange-400 bg-orange-50",
  ready_for_pickup: "border-cyan-400 bg-cyan-50",
  out_for_delivery: "border-indigo-400 bg-indigo-50",
  delivered: "border-green-400 bg-green-50",
};

function elapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function KDSPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { data: orders, loading, refetch } = useOrders();
  const [wsStatus, setWsStatus] = useState("connecting");
  const [now, setNow] = useState(Date.now());

  // Timer refresh
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket (socket.io-client)
  useEffect(() => {
    let socket: Socket | null = null;

    const initSocket = async () => {
      const { io } = await import("socket.io-client");
      const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://api:4001").replace("http://", "ws://").replace("https://", "wss://");
      socket = io(wsUrl, { transports: ["websocket"] });

      socket.on("connect", () => {
        setWsStatus("connected");
        socket.emit("join_kitchen");
      });

      socket.on("kitchen:new", () => {
        refetch();
      });

      socket.on("order:updated", () => {
        refetch();
      });

      socket.on("disconnect", () => setWsStatus("disconnected"));
    };

    initSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [refetch]);


  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    try {
      await dashApi.updateOrderStatus(orderId, newStatus, `Status zmieniony w KDS`);
      refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Nieznany błąd";
      toast({ title: "Błąd", description: msg, variant: "destructive" });
    }
  }, [refetch]);

  const activeOrders = orders?.filter((o) =>
    ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery"].includes(o.status)
  ) || [];

  const columns = statusFlow.filter((s) => s !== "delivered");

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black text-red-500 tracking-tight">WebowoROS</Link>
          <span className="text-neutral-500">|</span>
          <h1 className="text-lg font-bold">KDS — Kitchen Display System</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-xs text-neutral-400">{wsStatus === "connected" ? "Online" : "Łączenie..."}</span>
          </div>
          <span className="text-sm text-neutral-400">{(activeOrders?.length ?? 0)} aktywnych</span>
          <button onClick={logout} className="text-sm text-neutral-400 hover:text-white transition">Wyloguj</button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="p-6 overflow-x-auto">
        {loading ? (
          <div className="text-center text-neutral-400 py-20">Ładowanie zamówień...</div>
        ) : (activeOrders?.length ?? 0) === 0 ? (
          <div className="text-center text-neutral-500 py-20">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold">Brak aktywnych zamówień</p>
            <p className="text-sm mt-2">Nowe zamówienia pojawią się tutaj automatycznie.</p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max">
            {columns.map((status) => {
              const colOrders = activeOrders.filter((o) => o.status === status);
              return (
                <div key={status} className="w-80 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-400">
                      {statusLabels[status]}
                    </h2>
                    <span className="bg-neutral-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {(colOrders?.length ?? 0)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colOrders.map((order) => {
                      const elapsed = elapsedMinutes(order.createdAt);
                      const isUrgent = elapsed > 30 && status === "preparing";
                      return (
                        <div
                          key={order.id}
                          className={`rounded-xl p-4 border-2 ${statusColors[status]} ${isUrgent ? "animate-pulse border-red-500" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-lg text-neutral-900">{order.orderNumber}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUrgent ? "bg-red-500 text-white" : "bg-neutral-200 text-neutral-600"}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatElapsed(elapsed)}
                            </span>
                          </div>
                          <div className="space-y-1 mb-3">
                            {order.items?.map((item) => (
                              <div key={item.id} className="text-sm text-neutral-700">
                                <span className="font-semibold">{item.quantity}x</span> {item.product?.name || "Produkt"}
                                {item.addons?.length > 0 && (
                                  <span className="text-neutral-500 text-xs"> +{(item?.addons?.length ?? 0)} dod.</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-3 font-medium">
                              📝 {order.notes}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {statusFlow.indexOf(status) > 0 && (
                              <button
                                onClick={() => handleStatusChange(order.id, statusFlow[statusFlow.indexOf(status) - 1])}
                                className="flex-1 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-semibold hover:bg-neutral-300 transition flex items-center justify-center gap-1"
                              >
                                <ArrowLeft className="w-4 h-4" /> Wstecz
                              </button>
                            )}
                            {statusFlow.indexOf(status) < (statusFlow?.length ?? 0) - 1 && (
                              <button
                                onClick={() => handleStatusChange(order.id, statusFlow[statusFlow.indexOf(status) + 1])}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition flex items-center justify-center gap-1"
                              >
                                Dalej <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
      </DashboardShell>
    );
}
