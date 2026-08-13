'use client';

import { useState } from 'react';
import { Card, CardContent, Button, FreeDeliveryProgress } from '@ros/ui';

const mockBagItems = [
  { id: '1', name: 'Margherita 40cm', price: 39.00, addons: ['Extra ser', 'Pieczarki'], addonPrice: 8.00 },
  { id: '2', name: 'Capriciosa 40cm', price: 39.00, addons: [], addonPrice: 0 },
];

export default function BagPage() {
  const [items, setItems] = useState(mockBagItems);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price + item.addonPrice, 0);
  const delivery = subtotal >= 60 ? 0 : 8;
  const total = subtotal + delivery;

  return (
    <main className="min-h-screen bg-light py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-poppins text-3xl font-bold text-dark mb-6">🍕 Twoja torba</h1>

        {/* Bag visualization */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-6xl block mb-4">🛍️</span>
              <p className="text-lg">Twoja torba jest pusta</p>
              <p className="text-sm mt-2">Dodaj coś pysznego!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-dark">{item.name}</h3>
                    {item.addons.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        + {item.addons.join(', ')}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary mt-1">
                      {(item.price + item.addonPrice).toFixed(2)} zł
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-danger transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free delivery progress */}
        <div className="mb-6">
          <FreeDeliveryProgress currentAmount={subtotal} threshold={60} />
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Suma produktów</span>
              <span className="tabular-nums">{subtotal.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Dostawa</span>
              <span className={delivery === 0 ? 'text-accent font-semibold' : 'tabular-nums'}>
                {delivery === 0 ? 'DARMOWA 🔥' : `${delivery.toFixed(2)} zł`}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-lg font-bold text-dark">Razem</span>
              <span className="text-xl font-bold text-primary tabular-nums">{total.toFixed(2)} zł</span>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Button className="w-full mt-6 py-4 text-lg" disabled={items.length === 0}>
          🛒 Przejdź do dostawy →
        </Button>
      </div>
    </main>
  );
}
