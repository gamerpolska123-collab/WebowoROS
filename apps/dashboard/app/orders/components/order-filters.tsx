"use client";

import { Input, Button } from "@ros/ui";
import { OrdersFilters } from "@/lib/hooks";

const STATUS_OPTIONS = [
  { value: "", label: "Wszystkie" },
  { value: "pending_payment", label: "⏳ Oczekuje płatności" },
  { value: "paid", label: "💰 Opłacone" },
  { value: "confirmed", label: "✅ Potwierdzone" },
  { value: "preparing", label: "👨‍🍳 W przygotowaniu" },
  { value: "ready_for_pickup", label: "📦 Gotowe do odbioru" },
  { value: "out_for_delivery", label: "🚗 W drodze" },
  { value: "delivered", label: "🏠 Dostarczone" },
  { value: "cancelled", label: "❌ Anulowane" },
];

const DELIVERY_OPTIONS = [
  { value: "", label: "Wszystkie" },
  { value: "delivery", label: "Dostawa" },
  { value: "pickup", label: "Odbiór osobisty" },
];

interface Props {
  filters: OrdersFilters;
  onChange: (f: OrdersFilters) => void;
  onReset: () => void;
}

export function OrderFilters({ filters, onChange, onReset }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="🔍 Szukaj (nr zamówienia, telefon, nazwisko)..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <select
        className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm"
        value={filters.status || ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm"
        value={filters.deliveryType || ""}
        onChange={(e) => onChange({ ...filters, deliveryType: e.target.value || undefined })}
      >
        {DELIVERY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <input
        type="date"
        className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm"
        value={filters.dateFrom || ""}
        onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
        placeholder="Od"
      />
      <input
        type="date"
        className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm"
        value={filters.dateTo || ""}
        onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
        placeholder="Do"
      />
      <Button variant="outline" size="sm" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
