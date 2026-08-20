'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';

interface Addon {
  id: string;
  name: string;
  price: number;
  icon?: string;
}

interface AddonConfiguratorProps {
  productName: string;
  basePrice: number;
  addons: Addon[];
  onAddToBag: (selectedAddons: { addonId: string; quantity: number }[]) => void;
  className?: string;
}

export function AddonConfigurator({ productName, basePrice, addons, onAddToBag, className }: AddonConfiguratorProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const updateQuantity = (addonId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [addonId]: Math.max(0, Math.min(2, (prev[addonId] || 0) + delta)),
    }));
  };

  const totalPrice = basePrice + addons.reduce((sum, addon) => {
    return sum + (quantities[addon.id] || 0) * addon.price;
  }, 0);

  const selectedAddons = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([addonId, quantity]) => ({ addonId, quantity }));

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-dark">🍕 {productName}</h3>

      {/* Pizza visualization placeholder */}
      <div className="relative mx-auto h-48 w-48 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
        <span className="text-6xl">🍕</span>
        {/* Addon layers */}
        {addons.map((addon, idx) => {
          const qty = quantities[addon.id] || 0;
          if (qty === 0) return null;
          return (
            <div
              key={addon.id}
              className="absolute text-2xl animate-fadeIn"
              style={{
                top: `${20 + idx * 15}%`,
                left: `${20 + idx * 20}%`,
                transform: `rotate(${idx * 45}deg)`,
              }}
            >
              {addon.icon || '🧀'}
            </div>
          );
        })}
      </div>

      {/* Addon list */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Dodaj więcej smaku:</h4>
        {addons.map((addon) => {
          const qty = quantities[addon.id] || 0;
          return (
            <div
              key={addon.id}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 transition-all',
                qty > 0 ? 'border-primary bg-primary/5' : 'border-gray-200'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{addon.icon || '🧀'}</span>
                <div>
                  <p className="font-medium text-dark">{addon.name}</p>
                  <p className="text-sm text-primary font-semibold">+{(addon?.price ?? 0).toFixed(2)} zł</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(addon.id, -1)}
                  className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => updateQuantity(addon.id, 1)}
                  className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price summary */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Cena:</span>
          <span className="text-xl font-bold text-primary tabular-nums">{(totalPrice ?? 0).toFixed(2)} zł</span>
        </div>
        <Button
          className="w-full"
          onClick={() => onAddToBag(selectedAddons)}
        >
          🍕 Dodaj do torby
        </Button>
      </div>
    </div>
  );
}
