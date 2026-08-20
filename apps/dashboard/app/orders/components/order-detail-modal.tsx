"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from "@ros/ui";

interface OrderItem {
  product: { name: string; imageUrl?: string };
  quantity: number;
  unitPrice: number;
  notes?: string | null;
  addons?: { addonId: string; quantity: number; price: number }[];
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  discountAmount: number;
  deliveryType: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  contact: { firstName: string; lastName: string; phone: string; email: string };
  address?: { street: string; buildingNumber: string; apartmentNumber?: string; city: string; postalCode: string; floor?: string; intercom?: string } | null;
  items: OrderItem[];
  notes?: string | null;
  tip?: number | null;
}

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, open, onClose }: Props) {
  if (!order) return null;

  const STATUS_LABELS: Record<string, string> = {
    pending_payment: "Oczekuje płatności",
    paid: "Opłacone",
    confirmed: "Potwierdzone",
    preparing: "W przygotowaniu",
    ready_for_pickup: "Gotowe do odbioru",
    out_for_delivery: "W drodze",
    delivered: "Dostarczone",
    cancelled: "Anulowane",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Zamówienie {order.orderNumber}</span>
            <Badge variant={order.status === "cancelled" ? "destructive" : "default"}>
              {STATUS_LABELS[order.status] || order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide">Klient</p>
              <p className="font-medium">{order.contact.firstName} {order.contact.lastName}</p>
              <p>{order.contact.phone}</p>
              <p className="text-neutral-400">{order.contact.email}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-xs uppercase tracking-wide">Dostawa</p>
              <p className="font-medium">{order.deliveryType === "delivery" ? "Dostawa" : "Odbiór osobisty"}</p>
              {order.address && (
                <p className="text-neutral-500">
                  {order.address.street} {order.address.buildingNumber}
                  {order.address.apartmentNumber ? "/" + order.address.apartmentNumber : ""}
                  <br />
                  {order.address.postalCode} {order.address.city}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-neutral-400 text-xs uppercase tracking-wide mb-2">Produkty</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-neutral-400 ml-2">x{item.quantity}</span>
                    {item.notes && <p className="text-neutral-400 text-xs">{item.notes}</p>}
                  </div>
                  <span className="font-medium">{(Number(item.unitPrice) * item.quantity).toFixed(2)} zł</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
            <div className="space-y-1">
              <p>Suma: <span className="font-medium">{Number(order.totalAmount).toFixed(2)} zł</span></p>
              {Number(order.discountAmount) > 0 && (
                <p className="text-green-600">Rabat: -{Number(order.discountAmount).toFixed(2)} zł</p>
              )}
              {order.tip && Number(order.tip) > 0 && (
                <p className="text-neutral-400">Napiwek: {Number(order.tip).toFixed(2)} zł</p>
              )}
              <p className="text-lg font-bold">Do zapłaty: {Number(order.finalAmount).toFixed(2)} zł</p>
            </div>
            <div className="text-right text-xs text-neutral-400">
              <p>Płatność: {order.paymentMethod === "cash_on_delivery" ? "Gotówka przy odbiorze" : order.paymentMethod === "card_on_delivery" ? "Karta przy odbiorze" : order.paymentMethod}</p>
              <p>Status płatności: {order.paymentStatus}</p>
              <p>Złożono: {new Date(order.createdAt).toLocaleString("pl-PL")}</p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-amber-50 p-3 rounded-xl">
              <p className="text-neutral-400 text-xs uppercase tracking-wide">Uwagi</p>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
