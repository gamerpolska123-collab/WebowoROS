'use client';

import { useState } from 'react';
import { ProductCard, PizzaBag, FreeDeliveryProgress, UpsellModal, Badge, LastMinuteAddons } from '@ros/ui';

const mockProducts = [
  {
    id: '1',
    name: 'Margherita',
    description: 'Sos pomidorowy, ser mozzarella, bazylia',
    price: 29.00,
    isBestseller: true,
    isChefChoice: false,
    badges: ['wegetariańska'],
  },
  {
    id: '2',
    name: 'Capriciosa',
    description: 'Sos pomidorowy, ser, szynka, pieczarki',
    price: 35.00,
    isBestseller: true,
    isChefChoice: true,
    badges: [],
  },
  {
    id: '3',
    name: 'Quattro Formaggi',
    description: 'Cztery sery: mozzarella, gorgonzola, parmezan, ricotta',
    price: 38.00,
    isBestseller: false,
    isChefChoice: true,
    badges: ['wegetariańska'],
  },
  {
    id: '4',
    name: 'Diavola',
    description: 'Sos pomidorowy, ser, salami piccante, papryczki chili',
    price: 36.00,
    isBestseller: false,
    isChefChoice: false,
    badges: ['ostra'],
  },
];

const mockUpsell = [
  { id: 'u1', name: 'Cola 1L', price: 5.00 },
  { id: 'u2', name: 'Sos czosnkowy', price: 3.00 },
  { id: 'u3', name: 'Tiramisu', price: 12.00 },
];

const mockReviews = [
  { id: '1', name: 'Anna K.', rating: 5, text: 'Najlepsza pizza w mieście! Dostawa w 25 minut.', avatar: '👩' },
  { id: '2', name: 'Marek W.', rating: 5, text: 'Capriciosa z extra serem to hit. Polecam!', avatar: '👨' },
  { id: '3', name: 'Kasia N.', rating: 4, text: 'Świetna aplikacja, łatwo zamawiać. Pizza ciepła!', avatar: '👩‍🦰' },
];

export default function Home() {
  const [bag, setBag] = useState<{ id: string; name: string; price: number }[]>([]);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState('');
  const [address, setAddress] = useState('');

  const addToBag = (product: typeof mockProducts[0]) => {
    setBag((prev) => [...prev, { id: product.id, name: product.name, price: product.price }]);
    setLastAdded(product.name);
    setUpsellOpen(true);
  };

  const totalPrice = bag.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="min-h-screen bg-light">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-poppins text-xl font-bold text-primary">🍕 ROS</h1>
          <PizzaBag itemCount={bag.length} totalPrice={totalPrice} />
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primaryDark text-white py-12 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-poppins text-4xl font-bold mb-3">Weekendowa Promocja!</h2>
          <p className="text-lg opacity-90 mb-6">2 pizze + napój = 59 zł</p>
          <button className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Zamów teraz
          </button>
        </div>
      </section>

      {/* Address Check */}
      <section className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="📍 Wpisz adres → Sprawdź dostawę"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 rounded-full border border-gray-300 px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primaryDark transition-colors">
              Sprawdź
            </button>
          </div>
        </div>
      </section>

      {/* Free Delivery Progress */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <FreeDeliveryProgress currentAmount={totalPrice} threshold={60} />
      </div>

      {/* Category Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 flex gap-6 overflow-x-auto py-3">
          {['🔥 Szef Poleca', '🍕 Pizze', '🍝 Makarony', '🥗 Sałatki', '🥤 Napoje'].map((cat) => (
            <button key={cat} className="whitespace-nowrap text-sm font-medium text-dark hover:text-primary transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="font-poppins text-2xl font-bold text-dark">🔥 Szef Poleca</h2>
          <Badge variant="gold">TOP 5</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAdd={() => addToBag(product)}
            />
          ))}
        </div>
      </section>

      {/* Reviews Carousel */}
      <section className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-poppins text-2xl font-bold text-dark text-center mb-8">⭐ Co mówią nasi klienci</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{review.avatar}</span>
                  <div>
                    <p className="font-semibold text-dark">{review.name}</p>
                    <p className="text-sm text-gold">{'⭐'.repeat(review.rating)}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA Download */}
      <section className="bg-gradient-to-r from-dark to-darkLight text-white py-12 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <span className="text-5xl block mb-4">📱</span>
          <h2 className="font-poppins text-2xl font-bold mb-3">Pobierz aplikację ROS</h2>
          <p className="opacity-80 mb-6">Zamawiaj szybciej, otrzymuj powiadomienia o statusie zamówienia</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-dark px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <span>🤖</span> Android
            </button>
            <button className="bg-white text-dark px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <span>🍎</span> iOS
            </button>
          </div>
          <p className="text-xs opacity-60 mt-4">Lub dodaj do ekranu głównego z przeglądarki (PWA)</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-gray-400">🍕 Restaurant Order System © 2026</p>
          <div className="flex justify-center gap-4 mt-3 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Polityka prywatności</a>
            <a href="#" className="hover:text-white transition-colors">Regulamin</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>

      {/* Upsell Modal */}
      <UpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        productName={lastAdded}
        recommendations={mockUpsell}
        onAdd={(id) => {
          const item = mockUpsell.find((u) => u.id === id);
          if (item) setBag((prev) => [...prev, { id: item.id, name: item.name, price: item.price }]);
        }}
        onSkip={() => setUpsellOpen(false)}
      />

      {/* Sticky Bottom Bar (mobile) */}
      {bag.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-semibold">🍕 {bag.length} item · {totalPrice.toFixed(2)} zł</span>
            <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
              Zobacz zamówienie →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
