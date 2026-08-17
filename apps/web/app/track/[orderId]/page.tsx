"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder } from "@/lib/hooks";
import { CheckoutTimeline } from "@ros/ui";
import { Package, ChefHat, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

const statusSteps = [
  { status: "pending_payment", label: "Oczekiwanie na płatność", icon: <Clock className="w-5 h-5" />, description: "Twoje zamówienie czeka na potwierdzenie płatności." },
  { status: "paid", label: "Opłacone", icon: <CheckCircle className="w-5 h-5" />, description: "Płatność potwierdzona. Zamówienie trafia do kuchni." },
  { status: "confirmed", label: "Przyjęte", icon: <Package className="w-5 h-5" />, description: "Kuchnia potwierdziła zamówienie i rozpoczyna przygotowanie." },
  { status: "preparing", label: "W przygotowaniu", icon: <ChefHat className="w-5 h-5" />, description: "Twoje dania są właśnie przygotowywane przez naszych kucharzy." },
  { status: "ready_for_pickup", label: "Gotowe", icon: <Package className="w-5 h-5" />, description: "Zamówienie jest gotowe do wydania kierowcy lub odbioru." },
  { status: "out_for_delivery", label: "W drodze", icon: <Truck className="w-5 h-5" />, description: "Kierowca jest w drodze z Twoim zamówieniem!" },
  { status: "delivered", label: "Dostarczone", icon: <CheckCircle className="w-5 h-5" />, description: "Smacznego! Dziękujemy za zamówienie." },
  { status: "cancelled", label: "Anulowane", icon: <AlertCircle className="w-5 h-5" />, description: "Zamówienie zostało anulowane." },
];

function getCurrentStepIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

export default function TrackPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { data: order, loading, error, refetch } = useOrder(orderId);
  const [socketStatus, setSocketStatus] = useState<string>("connecting");

  // Poll every 10 seconds as fallback
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => { refetch(); }, 10000);
    return () => clearInterval(interval);
  }, [orderId, refetch]);

  // WebSocket — connect to API service (via Nginx in prod, direct in dev Docker)
  useEffect(() => {
    if (!orderId) return;
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://api:4001")
      .replace("http://", "ws://")
      .replace("https://", "wss://");
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setSocketStatus("connected");
      ws.send(JSON.stringify({ event: "join_order", data: { orderId } }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "order_status_updated" && msg.data?.orderId === orderId) {
          refetch();
        }
      } catch {}
    };

    ws.onclose = () => setSocketStatus("disconnected");
    ws.onerror = () => setSocketStatus("error");

    return () => ws.close();
  }, [orderId, refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-red-600 font-bold text-xl">Ładowanie zamówienia...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold text-xl mb-2">Nie znaleziono zamówienia</p>
          <p className="text-neutral-500 mb-6">{error || "Sprawdź numer zamówienia."}</p>
          <Link href="/" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition">
            Wróć na stronę główną
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex(order.status);
  const timelineSteps = statusSteps.slice(0, 7).map((s, i) => ({
    label: s.label,
    icon: s.icon,
    completed: i <= currentStep && order.status !== "cancelled",
    active: i === currentStep && order.status !== "cancelled",
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
          <Link href="/menu" className="text-sm font-medium text-red-600 hover:underline">Nowe zamówienie</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-500">Numer zamówienia</p>
              <h1 className="text-2xl font-black text-neutral-900">{order.orderNumber}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Status</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === "delivered" ? "bg-green-100 text-green-700" :
                order.status === "cancelled" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {statusSteps.find((s) => s.status === order.status)?.icon}
                {statusSteps.find((s) => s.status === order.status)?.label || order.status}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{new Date(order.createdAt).toLocaleString("pl-PL")}</span>
            <span className="font-bold text-neutral-900">{Number(order.finalAmount).toFixed(2)} zł</span>
          </div>
        </div>

        {order.status !== "cancelled" ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Postęp zamówienia</h2>
            <CheckoutTimeline steps={timelineSteps} currentStep={currentStep} />
            <p className="mt-4 text-sm text-neutral-600">{statusSteps[currentStep]?.description}</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h2 className="font-bold text-red-800">Zamówienie anulowane</h2>
                <p className="text-sm text-red-600">{order.history?.[0]?.note || "Zamówienie zostało anulowane."}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Zamówione produkty</h2>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="font-medium text-neutral-900">{item.product?.name || "Produkt"} x{item.quantity}</p>
                  {item.addons?.length > 0 && (
                    <p className="text-xs text-neutral-400">+ {item.addons.map((a: any) => `Dodatek x${a.quantity}`).join(", ")}</p>
                  )}
                </div>
                <p className="font-medium text-neutral-900">{Number(item.unitPrice * item.quantity).toFixed(2)} zł</p>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Wartość produktów</span><span>{Number(order.totalAmount).toFixed(2)} zł</span></div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm"><span className="text-neutral-500">Rabat</span><span className="text-green-600">-{Number(order.discountAmount).toFixed(2)} zł</span></div>
            )}
            {Number(order.tip) > 0 && (
              <div className="flex justify-between text-sm"><span className="text-neutral-500">Napiwek</span><span>{Number(order.tip).toFixed(2)} zł</span></div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-100">
              <span>Razem</span><span className="text-red-600">{Number(order.finalAmount).toFixed(2)} zł</span>
            </div>
          </div>
        </div>

        {order.address && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Adres dostawy</h2>
            <p className="text-neutral-700">{order.address.street} {order.address.buildingNumber}{order.address.apartmentNumber && `/${order.address.apartmentNumber}`}</p>
            <p className="text-neutral-500 text-sm">{order.address.postalCode} {order.address.city}</p>
            {order.address.floor && <p className="text-neutral-500 text-sm">Piętro: {order.address.floor}</p>}
            {order.address.intercom && <p className="text-neutral-500 text-sm">Domofon: {order.address.intercom}</p>}
          </div>
        )}

        {order.contact && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Dane kontaktowe</h2>
            <p className="text-neutral-700">{order.contact.firstName} {order.contact.lastName}</p>
            <p className="text-neutral-500 text-sm">{order.contact.phone}</p>
            <p className="text-neutral-500 text-sm">{order.contact.email}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <span className={`w-2 h-2 rounded-full ${socketStatus === "connected" ? "bg-green-500" : socketStatus === "connecting" ? "bg-amber-500" : "bg-red-500"}`} />
          {socketStatus === "connected" ? "Połączono (aktualizacje na żywo)" : socketStatus === "connecting" ? "Łączenie..." : "Offline (odświeżanie co 10s)"}
        </div>
      </main>
    </div>
  );
}
