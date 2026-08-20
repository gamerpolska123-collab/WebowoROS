"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMenu } from "@/lib/hooks";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@ros/shared-types";
import {
  ProductCard,
  Skeleton,
  PizzaBuilder,
  Dialog,
  DialogContent,
} from "@ros/ui";

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const { data: categories, isLoading, error } = useMenu();
  const { addItem, totalItems, subtotal } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const filteredCategories = selectedCategory
    ? categories?.filter((c) => c.slug === selectedCategory)
    : categories;

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
        <MenuHeader totalItems={totalItems} subtotal={subtotal} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <MenuHeader totalItems={totalItems} subtotal={subtotal} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              !selectedCategory
                ? "bg-red-600 text-white"
                : "bg-white text-neutral-700 border border-neutral-200 hover:border-red-300"
            }`}
          >
            Wszystko
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? "bg-red-600 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:border-red-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products by Category */}
        {filteredCategories?.map((category) => (
          <section key={category.id} className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

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

function MenuHeader({ totalItems, subtotal }: { totalItems: number; subtotal: number }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">
          WebowoROS
        </Link>
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
    </header>
  );
}
