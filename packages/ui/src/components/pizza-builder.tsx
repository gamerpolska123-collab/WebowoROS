'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';

interface SizeOption {
  id: string;
  name: string;
  price: number;
  diameter: number; // cm
}

interface CrustOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

interface Topping {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface PizzaBuilderProps {
  productName: string;
  basePrice: number;
  sizes: SizeOption[];
  crusts: CrustOption[];
  toppings: Topping[];
  onAddToBag: (config: { sizeId: string; crustId: string; toppingIds: string[] }) => void;
  className?: string;
}

export function PizzaBuilder({ productName, basePrice, sizes, crusts, toppings, onAddToBag, className }: PizzaBuilderProps) {
  const [selectedSize, setSelectedSize] = React.useState(sizes[0]?.id || '');
  const [selectedCrust, setSelectedCrust] = React.useState(crusts[0]?.id || '');
  const [selectedToppings, setSelectedToppings] = React.useState<string[]>([]);

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const size = sizes.find((s) => s.id === selectedSize);
  const crust = crusts.find((c) => c.id === selectedCrust);
  const toppingsPrice = selectedToppings.reduce((sum, tid) => {
    const t = toppings.find((top) => top.id === tid);
    return sum + (t?.price || 0);
  }, 0);
  const totalPrice = basePrice + (size?.price || 0) + (crust?.priceAdjustment || 0) + toppingsPrice;

  // Pizza visualization scale based on size
  const pizzaScale = size ? 0.8 + (size.diameter / 50) * 0.4 : 1;

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-semibold text-dark">🍕 Konfigurator — {productName}</h3>

      {/* Pizza Visualization */}
      <div className="flex justify-center py-4">
        <div
          className="relative rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-xl transition-all duration-500"
          style={{
            width: `${200 * pizzaScale}px`,
            height: `${200 * pizzaScale}px`,
            border: selectedCrust === 'thick' ? '12px solid #F4A261' : '4px solid #F4A261',
          }}
        >
          <span className="text-6xl">🍕</span>
          {/* Topping layers */}
          {selectedToppings.map((tid, idx) => {
            const t = toppings.find((top) => top.id === tid);
            if (!t) return null;
            const angle = (idx * 137.5 * Math.PI) / 180;
            const radius = 30 + (idx % 3) * 20;
            return (
              <div
                key={tid}
                className="absolute text-2xl animate-bounceIn"
                style={{
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {t.icon}
              </div>
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Rozmiar</h4>
        <div className="flex gap-2">
          {sizes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSize(s.id)}
              className={cn(
                'flex-1 rounded-lg border p-3 text-center transition-all',
                selectedSize === s.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-gray-500">{s.diameter} cm</p>
              <p className="text-sm font-bold text-primary">{s.price.toFixed(2)} zł</p>
            </button>
          ))}
        </div>
      </div>

      {/* Crust Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ciasto</h4>
        <div className="flex gap-2">
          {crusts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCrust(c.id)}
              className={cn(
                'flex-1 rounded-lg border p-3 text-center transition-all',
                selectedCrust === c.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">
                {c.priceAdjustment > 0 ? `+${c.priceAdjustment.toFixed(2)} zł` : 'Standard'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Toppings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Dodatki</h4>
        <div className="grid grid-cols-3 gap-2">
          {toppings.map((t) => {
            const selected = selectedToppings.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTopping(t.id)}
                className={cn(
                  'rounded-lg border p-2 text-center transition-all',
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-xl block">{t.icon}</span>
                <span className="text-xs font-medium">{t.name}</span>
                <span className="text-xs text-primary font-semibold block">+{t.price.toFixed(2)} zł</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price & CTA */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Twoja pizza:</span>
          <span className="text-2xl font-bold text-primary tabular-nums">{totalPrice.toFixed(2)} zł</span>
        </div>
        <Button
          className="w-full"
          onClick={() => onAddToBag({ sizeId: selectedSize, crustId: selectedCrust, toppingIds: selectedToppings })}
        >
          🍕 Dodaj do torby
        </Button>
      </div>
    </div>
  );
}
