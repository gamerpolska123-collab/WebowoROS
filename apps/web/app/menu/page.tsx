"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMenu } from "@/lib/hooks";
import { useCart } from "@/lib/cart-context";
import { ProductCard } from "@ros/ui";
import { PizzaBag } from "@ros/ui";
import { Skeleton } from "@ros/ui";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const { data: categories, isLoading, error } = useMenu();
  const { totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory);

  const filteredCategories = selectedCategory
    ? categories?.filter((c) => c.slug === selectedCategory)
    : categories;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <MenuHeader totalItems={totalItems} />
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
          <p className="text-neutral-500">Spróbuj ponownie później</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <MenuHeader totalItems={totalItems} />

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
                  onAdd={() => {
                    // TODO: Open PizzaBuilder or add directly
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MenuHeader({ totalItems }: { totalItems: number }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">
          WebowoROS
        </Link>
        <Link href="/bag" className="relative">
          <PizzaBag count={totalItems} className="w-8 h-8 text-red-600" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
