"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { FreeDeliveryProgress, PizzaBag, CheckoutTimeline } from "@ros/ui";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function BagPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems, freeDeliveryThreshold, clearCart } = useCart();

  const deliveryCost = subtotal >= freeDeliveryThreshold ? 0 : 9.99;
  const total = subtotal + deliveryCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
            <Link href="/menu" className="text-sm font-medium text-red-600 hover:underline">Wróć do menu</Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <PizzaBag count={0} className="mx-auto mb-4 w-16 h-16 text-neutral-300" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Twoja torba jest pusta</h1>
            <p className="text-neutral-500 mb-6">Dodaj coś pysznego z naszego menu!</p>
            <Link href="/menu" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition">
              Przeglądaj menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
          <Link href="/menu" className="text-sm font-medium text-red-600 hover:underline">Dodaj więcej</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Twoja torba</h1>
        <p className="text-neutral-500 mb-6">{totalItems} pozycji</p>

        <FreeDeliveryProgress current={subtotal} threshold={freeDeliveryThreshold} className="mb-8" />

        {/* Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex gap-4">
              {item.imageUrl && (
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                  <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-neutral-900 truncate">{item.name}</h3>
                {item.variantName && <p className="text-sm text-neutral-500">{item.variantName}</p>}
                {item.addons.length > 0 && (
                  <p className="text-xs text-neutral-400 mt-1">
                    + {item.addons.map((a) => `${a.name} x${a.quantity}`).join(", ")}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-900">
                      {((item.unitPrice + item.addons.reduce((s, a) => s + a.price * a.quantity, 0)) * item.quantity).toFixed(2)} zł
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Podsumowanie</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Wartość produktów</span>
              <span className="font-medium">{subtotal.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Dostawa</span>
              <span className={`font-medium ${deliveryCost === 0 ? "text-green-600" : ""}`}>
                {deliveryCost === 0 ? "Darmowa" : `${deliveryCost.toFixed(2)} zł`}
              </span>
            </div>
            <div className="border-t border-neutral-100 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-neutral-900">Razem</span>
              <span className="font-bold text-xl text-red-600">{total.toFixed(2)} zł</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/checkout"
            className="flex-1 px-8 py-4 bg-red-600 text-white font-bold rounded-full text-center hover:bg-red-700 transition shadow-lg text-lg"
          >
            Przejdź do kasy →
          </Link>
          <button
            onClick={clearCart}
            className="px-8 py-4 bg-neutral-100 text-neutral-700 font-medium rounded-full hover:bg-neutral-200 transition"
          >
            Wyczyść torbę
          </button>
        </div>
      </main>
    </div>
  );
}
