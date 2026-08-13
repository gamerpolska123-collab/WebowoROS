'use client';

import { useState } from 'react';
import { ProductCard, PizzaBag, FreeDeliveryProgress, Badge } from '@ros/ui';

const categories = [
  { id: 'recommended', label: '🔥 Szef Poleca', products: [
    { id: '1', name: 'Margherita', description: 'Sos pomidorowy, ser mozzarella, bazylia', price: 29.00, isBestseller: true, badges: ['wegetariańska'] },
    { id: '2', name: 'Capriciosa', description: 'Sos pomidorowy, ser, szynka, pieczarki', price: 35.00, isBestseller: true, isChefChoice: true, badges: [] },
  ]},
  { id: 'pizza', label: '🍕 Pizze', products: [
    { id: '3', name: 'Quattro Formaggi', description: 'Cztery sery', price: 38.00, isChefChoice: true, badges: ['wegetariańska'] },
    { id: '4', name: 'Diavola', description: 'Salami piccante, chili', price: 36.00, badges: ['ostra'] },
    { id: '5', name: 'Hawajska', description: 'Szynka, ananas', price: 34.00, badges: [] },
    { id: '6', name: 'Pepperoni', description: 'Pepperoni, ser', price: 37.00, isBestseller: true, badges: [] },
  ]},
  { id: 'pasta', label: '🍝 Makarony', products: [
    { id: '7', name: 'Spaghetti Bolognese', description: 'Makaron z sosem mięsnym', price: 28.00, badges: [] },
    { id: '8', name: 'Penne Arrabbiata', description: 'Pikantny sos pomidorowy', price: 26.00, badges: ['ostra', 'wegetariańska'] },
  ]},
  { id: 'salad', label: '🥗 Sałatki', products: [
    { id: '9', name: 'Cezar', description: 'Kurczak, parmezan, grzanki', price: 24.00, badges: [] },
    { id: '10', name: 'Grecka', description: 'Feta, oliwki, ogórek', price: 22.00, badges: ['wegetariańska'] },
  ]},
  { id: 'drinks', label: '🥤 Napoje', products: [
    { id: '11', name: 'Coca-Cola 1L', description: '', price: 5.00, badges: [] },
    { id: '12', name: 'Sprite 0.5L', description: '', price: 3.50, badges: [] },
    { id: '13', name: 'Woda niegazowana 0.5L', description: '', price: 2.50, badges: [] },
  ]},
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('recommended');
  const [bag, setBag] = useState<{ id: string; name: string; price: number }[]>([]);

  const addToBag = (product: { id: string; name: string; price: number }) => {
    setBag((prev) => [...prev, product]);
  };

  const totalPrice = bag.reduce((sum, item) => sum + item.price, 0);
  const activeProducts = categories.find((c) => c.id === activeCategory)?.products || [];

  return (
    <main className="min-h-screen bg-light">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-poppins text-xl font-bold text-primary">🍕 ROS Menu</h1>
          <PizzaBag itemCount={bag.length} totalPrice={totalPrice} />
        </div>
      </header>

      {/* Free Delivery Progress */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <FreeDeliveryProgress currentAmount={totalPrice} threshold={60} />
      </div>

      {/* Category Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 flex gap-2 overflow-x-auto py-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="font-poppins text-2xl font-bold text-dark">
            {categories.find((c) => c.id === activeCategory)?.label}
          </h2>
          <Badge variant="outline">{activeProducts.length} produktów</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAdd={() => addToBag(product)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
