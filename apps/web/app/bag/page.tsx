"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { FreeDeliveryProgress, PizzaBag, CheckoutTimeline } from "@ros/ui";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function BagPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems, freeDeliveryThreshold, deliveryCost, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <BagHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <PizzaBag count={0} className="mx-auto mb-4 w-16 h-16 text-neutral-300" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Twoja torba jest pusta</h1>
            <p className="text-neutral-500 mb-6">Dodaj coś pysznego z naszego menu!</p>
            <Link href="/menu" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition inline-block">
              Przeglądaj menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <BagHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Twoja torba</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex gap-4"
              >
                <div className="w-24 h-24 rounded-xl bg-neutral-100 flex-shrink-0 overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍕</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-900 truncate">{item.name}</h3>
                  {item.variantName && (
                    <p className="text-sm text-neutral-500">{item.variantName}</p>
                  )}
                  {item.addons.length > 0 && (
                    <p className="text-sm text-neutral-500 truncate">
                      + {item.addons.map((a) => a.name).join(", ")}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-neutral-900">
                        {((item.basePrice + (item.variantPriceAdjustment || 0) + item.addons.reduce((s, a) => s + a.price * a.quantity, 0)) * item.quantity).toFixed(2)} zł
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-neutral-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-neutral-500 hover:text-red-600 transition"
            >
              Wyczyść torbę
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 sticky top-24">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Podsumowanie</h2>

              <FreeDeliveryProgress current={subtotal} threshold={freeDeliveryThreshold} />

              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Produkty ({totalItems})</span>
                  <span>{subtotal.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Dostawa</span>
                  <span className={deliveryCost === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryCost === 0 ? "Darmowa" : `${deliveryCost.toFixed(2)} zł`}
                  </span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="font-bold text-neutral-900">Razem</span>
                  <span className="font-bold text-xl text-red-600">{total.toFixed(2)} zł</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Przejdź do checkout
              </Link>

              <Link
                href="/menu"
                className="mt-3 w-full py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition text-center block"
              >
                Kontynuuj zakupy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BagHeader() {
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">WebowoROS</Link>
        <Link href="/menu" className="text-sm font-medium text-red-600 hover:underline">Wróć do menu</Link>
      </div>
    </header>
  );
}
