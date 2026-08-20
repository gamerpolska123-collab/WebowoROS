"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenu } from "@/lib/hooks";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import type { Product } from "@ros/shared-types";
import {
  ProductCard,
  FreeDeliveryProgress,
  Dialog,
  DialogContent,
  PizzaBuilder,
  Skeleton,
} from "@ros/ui";

export default function HomePage() {
  const router = useRouter();
  const { data: categories, isLoading, error } = useMenu();
  const { addItem, items, totalItems, subtotal, freeDeliveryThreshold } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const featuredProducts =
    categories?.flatMap((c) => c.products).filter((p) => p.isFeatured) || [];

  const handleAddToCart = (product: Product) => {
    if ((product?.variants?.length ?? 0) > 0) {
      setSelectedProduct(product);
      setBuilderOpen(true);
      return;
    }
    if ((product?.addons?.length ?? 0) > 0) {
      setSelectedProduct(product);
      setBuilderOpen(true);
      return;
    }
    // Add directly — no variants, no addons
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      basePrice: Number(product.basePrice),
      addons: [],
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <HeaderSkeleton />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 font-bold text-xl mb-2">Błąd ładowania menu</p>
          <p className="text-neutral-500">
            {error instanceof Error ? error.message : "Spróbuj ponownie później"}
          </p>
          <button
            onClick={() => router.refresh()}
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
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-600 hidden sm:inline">
                  Cześć, {user?.firstName}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-sm text-neutral-500 hover:text-red-600 transition"
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-red-600 hover:underline">
                Zaloguj
              </Link>
            )}

            <button
              onClick={() => router.push("/bag")}
              className="relative flex items-center gap-2 rounded-full px-4 py-2 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="text-sm font-bold">{(subtotal ?? 0).toFixed(2)} zł</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Zamów swoją ulubioną pizzę
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Bez pośredników, bez ukrytych opłat. Bezpośrednio od Twojej ulubionej pizzerii.
          </p>
          <Link
            href="/menu"
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-full text-lg hover:bg-red-50 transition shadow-lg"
          >
            Przeglądaj menu
          </Link>
        </div>
      </section>

      {/* Free Delivery Progress */}
      {totalItems > 0 && (
        <div className="bg-white border-b border-neutral-200 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <FreeDeliveryProgress current={subtotal} threshold={freeDeliveryThreshold} />
          </div>
        </div>
      )}

      {/* Featured Products */}
      {(featuredProducts?.length ?? 0) > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Polecane</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Nasze menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/menu?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square bg-neutral-100 hover:bg-red-50 transition"
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🍕
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-bold text-lg">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pizza Builder Dialog */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <PizzaBuilder
              product={selectedProduct}
              onAddToCart={(config) => {
                addItem(config);
                setBuilderOpen(false);
              }}
              onCancel={() => setBuilderOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}
