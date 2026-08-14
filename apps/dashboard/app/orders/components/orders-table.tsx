"use client";

import { Button } from "@ros/ui";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "⏳ Oczekuje płatności", color: "bg-amber-100 text-amber-700" },
  paid: { label: "💰 Opłacone", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "✅ Potwierdzone", color: "bg-emerald-100 text-emerald-700" },
  preparing: { label: "👨‍🍳 W przygotowaniu", color: "bg-orange-100 text-orange-700" },
  ready_for_pickup: { label: "📦 Gotowe do odbioru", color: "bg-teal-100 text-teal-700" },
  out_for_delivery: { label: "🚗 W drodze", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "🏠 Dostarczone", color: "bg-green-100 text-green-700" },
  cancelled: { label: "❌ Anulowane", color: "bg-red-100 text-red-700" },
};

const NEXT_STATUS: Record<string, { label: string; value: string } | null> = {
  pending_payment: { label: "Potwierdź płatność", value: "paid" },
  paid: { label: "Potwierdź zamówienie", value: "confirmed" },
  confirmed: { label: "Przyjmij do kuchni", value: "preparing" },
  preparing: { label: "Gotowe", value: "ready_for_pickup" },
  ready_for_pickup: { label: "Wydaj / W drogę", value: "out_for_delivery" },
  out_for_delivery: { label: "Dostarczone", value: "delivered" },
  delivered: null,
  cancelled: null,
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  deliveryType: string;
  createdAt: string;
  contact: { firstName: string; lastName: string; phone: string };
  address?: { street: string; buildingNumber: string; city: string } | null;
  items: { product: { name: string }; quantity: number; unitPrice: number }[];
  notes?: string | null;
}

interface Props {
  orders: Order[];
  onStatusChange: (id: string, status: string) => void;
  onCancel: (id: string) => void;
  onView: (order: Order) => void;
  onSimulatePayment?: (id: string) => void;
  updatingId?: string | null;
  simulatingId?: string | null;
}

export function OrdersTable({ orders, onStatusChange, onCancel, onView, onSimulatePayment, updatingId, simulatingId }: Props) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400">
        <p className="text-lg">Brak zamówień</p>
        <p className="text-sm">Zmień filtry lub sprawdź później</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Nr</th>
            <th className="px-4 py-3 text-left font-semibold">Klient</th>
            <th className="px-4 py-3 text-left font-semibold">Typ</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Kwota</th>
            <th className="px-4 py-3 text-left font-semibold">Godzina</th>
            <th className="px-4 py-3 text-right font-semibold">Akcje</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((order) => {
            const cfg = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
            const next = NEXT_STATUS[order.status];
            const isUpdating = updatingId === order.id;
            return (
              <tr key={order.id} className="hover:bg-neutral-50 transition">
                <td className="px-4 py-3 font-mono font-bold">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.contact.firstName} {order.contact.lastName}</div>
                  <div className="text-neutral-400 text-xs">{order.contact.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-100">
                    {order.deliveryType === "delivery" ? "🚚 Dostawa" : "🏪 Odbiór"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold">{Number(order.finalAmount).toFixed(2)} zł</td>
                <td className="px-4 py-3 text-neutral-400 text-xs">
                  {new Date(order.createdAt).toLocaleString("pl-PL")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => onView(order)}>
                      Szczegóły
                    </Button>
                    {next && (
                      <Button size="sm" disabled={isUpdating} onClick={() => onStatusChange(order.id, next.value)}>
                        {isUpdating ? "..." : next.label}
                      </Button>
                    )}
                    {order.status === "pending_payment" && onSimulatePayment && (
                      <Button size="sm" variant="secondary" onClick={() => onSimulatePayment(order.id)} disabled={simulatingId === order.id}>
                        {simulatingId === order.id ? "..." : "💳 Płatność"}
                      </Button>
                    )}
                    {(order.status !== "delivered" && order.status !== "cancelled") && (
                      <Button variant="destructive" size="sm" disabled={isUpdating} onClick={() => onCancel(order.id)}>
                        Anuluj
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
