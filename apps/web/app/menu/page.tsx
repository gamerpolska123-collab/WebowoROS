"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMenu } from "@/lib/hooks";
import { useCart } from "@/lib/cart-context";
import { ProductCard, PizzaBag, PizzaBuilder, Dialog, DialogContent, Tabs, TabsList, TabsTrigger } from "@ros/ui";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const { data: categories, loading, error } = useMenu();
  const { totalItems, subtotal, freeDeliveryThreshold } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!activeCategory) return categories;
    return categories.filter((c) => c.slug === activeCategory);
  }, [categories, activeCategory]);

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
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
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
            <Link href="/" className="text-sm font-medium text-neutral-700 hover:text-red-600 transition">Strona główna</Link>
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

      {/* Category Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Tabs value={activeCategory || "all"} onValueChange={(v) => setActiveCategory(v === "all" ? null : v)}>
            <TabsList className="flex gap-2 overflow-x-auto">
              <TabsTrigger value="all" className="px-4 py-2 rounded-full text-sm font-medium">Wszystkie</TabsTrigger>
              {categories?.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.slug} className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {filteredCategories.map((category) => (
          <section key={category.id} id={category.slug} className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">{category.name}</h2>
            <p className="text-neutral-500 mb-6">{category.products.length} pozycji</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.products.map((product) => (
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
        ))}
      </main>

      {/* Sticky Bottom Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">{totalItems} pozycji</p>
              <p className="text-xl font-bold text-neutral-900">{subtotal.toFixed(2)} zł</p>
            </div>
            <Link href="/bag" className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg">
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
              onAddToCart={() => setBuilderOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
