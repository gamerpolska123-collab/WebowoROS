"use client";

import { FreeDeliveryProgress } from "@ros/ui";
import { CartItem } from "@/lib/cart-context";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  freeDeliveryThreshold: number;
  deliveryCost: number;
  total: number;
  onNext: () => void;
}

export default function OrderSummary({ items, subtotal, freeDeliveryThreshold, deliveryCost, total, onNext }: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Twoje zamówienie</h2>
      <FreeDeliveryProgress current={subtotal} threshold={freeDeliveryThreshold} />
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-3 border-b border-neutral-100 last:border-0">
            <div>
              <p className="font-medium text-neutral-900">{item.name} x{item.quantity}</p>
              {item.variantName && <p className="text-sm text-neutral-500">{item.variantName}</p>}
            </div>
            <p className="font-medium text-neutral-900">
              {((item.unitPrice + item.addons.reduce((s, a) => s + a.price * a.quantity, 0)) * item.quantity).toFixed(2)} zł
            </p>
          </div>
        ))}
        <div className="border-t border-neutral-200 pt-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Wartość produktów</span>
            <span>{subtotal.toFixed(2)} zł</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Dostawa</span>
            <span className={deliveryCost === 0 ? "text-green-600" : ""}>
              {deliveryCost === 0 ? "Darmowa" : `${deliveryCost.toFixed(2)} zł`}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-100">
            <span>Razem</span>
            <span className="text-red-600">{total.toFixed(2)} zł</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="w-full px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg text-lg"
      >
        Dalej: Dane dostawy →
      </button>
    </div>
  );
}
