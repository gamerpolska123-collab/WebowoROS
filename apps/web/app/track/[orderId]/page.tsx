'use client';

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder, useCancelOrder } from "@/lib/hooks";
import type { Socket } from "socket.io-client";
import type { OrderItem, OrderItemAddon } from "@ros/shared-types";
import { useAuth } from "@/lib/auth-context";
import { getWebSocketUrl } from "@/lib/api";
import { Clock, MapPin, Phone, User, Package, CheckCircle, ChevronLeft, XCircle } from "lucide-react";

const statusFlow = [
  { key: "confirmed", label: "Przyjęte", icon: Package },
  { key: "preparing", label: "W przygotowaniu", icon: Clock },
  { key: "ready_for_pickup", label: "Gotowe", icon: CheckCircle },
  { key: "out_for_delivery", label: "W drodze", icon: MapPin },
  { key: "delivered", label: "Dostarczone", icon: CheckCircle },
];

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

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { data: order, isLoading, error } = useOrder(orderId);
  const { isAuthenticated } = useAuth();
  const cancelOrder = useCancelOrder();
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // WebSocket for real-time updates (socket.io-client)
  useEffect(() => {
    if (!orderId) return;
    let socket: Socket | null = null;

    const initSocket = async () => {
      const { io } = await import("socket.io-client");
      const wsUrl = getWebSocketUrl();
      socket = io(wsUrl, { transports: ["websocket"] });

      socket.on("connect", () => {
        setWsStatus("connected");
        const token = typeof document !== 'undefined' ? document.cookie.match(/access_token=([^;]+)/)?.[1] : undefined;
        if (token) socket.emit("auth", { token });
        socket.emit("join_order", { orderId });
      });

      socket.on("order_status_updated", (msg: { orderId: string; status?: string }) => {
        if (msg.orderId === orderId) {
          // React Query auto-refetch via invalidation
        }
      });

      socket.on("disconnect", () => setWsStatus("disconnected"));
      socket.on("connect_error", () => setWsStatus("disconnected"));
    };

    initSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [orderId]);

  // Calculate estimated time
  useEffect(() => {
    if (!order) return;
    const times: Record<string, string> = {
      confirmed: "25-35 minut",
      preparing: "15-25 minut",
      ready_for_pickup: "5-10 minut",
      out_for_delivery: "5-15 minut",
      delivered: "Dostarczone",
    };
    setEstimatedTime(times[order.status] || "");
  }, [order?.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Ładowanie zamówienia...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Nie znaleziono zamówienia</h1>
          <p className="text-neutral-500 mb-6">Sprawdź numer zamówienia lub skontaktuj się z nami.</p>
          <Link href="/track" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition inline-block">
            Twoje zamówienia
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.findIndex((s) => s.key === order.status);
  const canCancel = ["pending_payment", "paid", "confirmed"].includes(order.status);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
          <div className="flex items-center gap-3">
            <Link href="/track" className="text-sm text-neutral-500 hover:text-red-600 transition flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Wszystkie
            </Link>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                wsStatus === "connected" ? "bg-green-500" : wsStatus === "connecting" ? "bg-amber-500" : "bg-red-500"
              }`} />
              <span className="text-xs text-neutral-500">
                {wsStatus === "connected" ? "Live" : wsStatus === "connecting" ? "Łączenie..." : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-neutral-900 mb-2">
            Zamówienie #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-neutral-500">
            Złożone {new Date(order.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
          {estimatedTime && order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full font-medium">
              <Clock className="w-4 h-4" />
              Szacowany czas: {estimatedTime}
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Status zamówienia</h2>
          {order.status === "cancelled" ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="font-bold text-red-700">Zamówienie anulowane</p>
                <p className="text-sm text-red-600">{order.cancellationReason || "Zamówienie zostało anulowane"}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-200" />
              <div className="space-y-6">
                {statusFlow.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = status.icon;
                  return (
                    <div key={status.key} className="relative flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        isCompleted ? "bg-red-600 text-white" : "bg-neutral-200 text-neutral-400"
                      } ${isCurrent ? "ring-4 ring-red-100" : ""}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`font-medium ${isCompleted ? "text-neutral-900" : "text-neutral-400"}`}>
                          {status.label}
                        </p>
                        {isCurrent && <p className="text-sm text-red-600 font-medium">Aktualny status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Szczegóły zamówienia</h2>
          <div className="space-y-3">
            {order.items?.map((item: OrderItem, idx: number) => (
              <div key={idx} className="flex justify-between items-start py-3 border-b border-neutral-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{item.quantity}x {item.name}</p>
                  {item.variantName && <p className="text-sm text-neutral-500">{item.variantName}</p>}
                  {item.addons?.length > 0 && (
                    <p className="text-sm text-neutral-500">+ {item.addons.map((a: OrderItemAddon) => a.name).join(", ")}</p>
                  )}
                  {item.notes && <p className="text-sm text-amber-600 italic">{item.notes}</p>}
                </div>
                <span className="font-bold text-neutral-900 ml-4">{(item?.totalPrice ?? 0).toFixed(2)} zł</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
            <div className="flex justify-between text-neutral-600">
              <span>Suma pozycji</span>
              <span>{order.subtotal?.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Dostawa</span>
              <span className={order.deliveryCost === 0 ? "text-green-600 font-medium" : ""}>
                {order.deliveryCost === 0 ? "Darmowa" : `${order.deliveryCost?.toFixed(2)} zł`}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Rabat</span>
                <span>-{order.discountAmount?.toFixed(2)} zł</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-bold text-neutral-900">Razem</span>
              <span className="font-bold text-xl text-red-600">{order.total?.toFixed(2)} zł</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Dane dostawy</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-neutral-400" />
              <span className="text-neutral-700">{order.deliveryFirstName} {order.deliveryLastName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-neutral-400" />
              <span className="text-neutral-700">{order.deliveryPhone}</span>
            </div>
            {order.deliveryType === "delivery" ? (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">
                  {order.deliveryStreet} {order.deliveryBuildingNumber}
                  {order.deliveryApartmentNumber ? `/${order.deliveryApartmentNumber}` : ""}, {order.deliveryPostalCode} {order.deliveryCity}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">Odbiór osobisty</span>
              </div>
            )}
            {order.deliveryNotes && (
              <div className="mt-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-800">
                <span className="font-medium">Uwagi:</span> {order.deliveryNotes}
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Płatność</h2>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Metoda</span>
            <span className="font-medium text-neutral-900">
              {order.paymentMethod === "cash_on_delivery" ? "Gotówka przy odbiorze" : "Karta przy odbiorze"}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-neutral-600">Status</span>
            <span className={`font-medium ${
              order.paymentStatus === "paid" ? "text-green-600" : order.paymentStatus === "failed" ? "text-red-600" : "text-amber-600"
            }`}>
              {order.paymentStatus === "paid" ? "Opłacone" : order.paymentStatus === "failed" ? "Nieudana" : "Oczekuje"}
            </span>
          </div>
        </div>

        {/* Cancel Order */}
        {canCancel && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-3 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition"
              >
                Anuluj zamówienie
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600 text-center">Czy na pewno chcesz anulować to zamówienie?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition"
                  >
                    Nie, zostaw
                  </button>
                  <button
                    onClick={() => cancelOrder.mutate(orderId)}
                    disabled={cancelOrder.isPending}
                    className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {cancelOrder.isPending ? "Anulowanie..." : "Tak, anuluj"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
