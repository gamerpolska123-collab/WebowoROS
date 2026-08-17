"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenu } from "@/lib/hooks";
import { useCart } from "@/lib/cart-context";
import { ProductCard } from "@ros/ui";
import { FreeDeliveryProgress } from "@ros/ui";
import { PizzaBag } from "@ros/ui";
import { Dialog, DialogContent } from "@ros/ui";
import { PizzaBuilder } from "@ros/ui";

export default function HomePage() {
  const { data: categories, loading, error } = useMenu();
  const { items, totalItems, subtotal, freeDeliveryThreshold } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const featuredProducts = categories?.flatMap((c) => c.products).filter((p) => p.isFeatured) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-pulse text-red-600 font-bold text-xl">Ładowanie menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 font-bold text-xl mb-2">Błąd ładowania menu</p>
          <p className="text-neutral-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Odśwież
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">
            WebowoROS
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-sm font-medium text-neutral-700 hover:text-red-600 transition">
              Menu
            </Link>
            <Link href="/bag" className="relative">
              <PizzaBag count={totalItems} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Twoja ulubiona pizza,<br />bez pośredników
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Zamawiaj bezpośrednio — szybciej, taniej, świeżej. Bez prowizji od zewnętrznych aplikacji.
          </p>
          <Link
            href="/menu"
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-full text-lg hover:bg-red-50 transition shadow-lg"
          >
            Zamów teraz
          </Link>
        </div>
      </section>

      {/* Free Delivery Progress */}
      {subtotal > 0 && (
        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
          <FreeDeliveryProgress current={subtotal} threshold={freeDeliveryThreshold} />
        </div>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <Link
            href="/menu"
            className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-full whitespace-nowrap shadow-sm"
          >
            Wszystkie
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="px-5 py-2.5 bg-white text-neutral-700 font-medium rounded-full border border-neutral-200 whitespace-nowrap hover:border-red-300 hover:text-red-600 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Polecane</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => {
                  setSelectedProduct(product);
                  setBuilderOpen(true);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        {categories?.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">{category.name}</h2>
              <Link
                href={`/menu?category=${category.slug}`}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Zobacz wszystkie →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => {
                    setSelectedProduct(product);
                    setBuilderOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Sticky Bottom Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">{totalItems} pozycji</p>
              <p className="text-xl font-bold text-neutral-900">{subtotal.toFixed(2)} zł</p>
            </div>
            <Link
              href="/bag"
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg"
            >
              Do torby →
            </Link>
          </div>
        </div>
      )}

      {/* Pizza Builder Modal */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <PizzaBuilder
              product={selectedProduct}
              onAddToCart={(item) => {
                // handled by PizzaBuilder internally via callback
                setBuilderOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
