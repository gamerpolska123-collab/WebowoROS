'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';

interface BundleSlot {
  categoryId: string;
  label: string;
  quantity: number;
  options: { id: string; name: string; price: number }[];
}

interface BundleBuilderProps {
  name: string;
  discountPercent: number;
  slots: BundleSlot[];
  onAddBundle: (selections: Record<string, string[]>) => void;
  className?: string;
}

export function BundleBuilder({ name, discountPercent, slots, onAddBundle, className }: BundleBuilderProps) {
  const [selections, setSelections] = React.useState<Record<string, string[]>>({});

  const toggleSelection = (slotIdx: number, optionId: string) => {
    const slot = slots[slotIdx];
    const current = selections[slotIdx] || [];
    const max = slot.quantity;

    if (current.includes(optionId)) {
      setSelections({ ...selections, [slotIdx]: current.filter((id) => id !== optionId) });
    } else if ((current?.length ?? 0) < max) {
      setSelections({ ...selections, [slotIdx]: [...current, optionId] });
    }
  };

  const calculatePrice = () => {
    let total = 0;
    slots.forEach((slot, idx) => {
      const selected = selections[idx] || [];
      selected.forEach((id) => {
        const opt = slot.options.find((o) => o.id === id);
        if (opt) total += opt.price;
      });
    });
    const discounted = total * (1 - discountPercent / 100);
    return { original: total, discounted };
  };

  const { original, discounted } = calculatePrice();
  const allFilled = slots.every((slot, idx) => ((selections?.[idx])?.length ?? 0) === slot.quantity);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-primary to-primaryDark text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">🎁 {name}</CardTitle>
          <Badge variant="gold" className="text-sm">-{discountPercent}%</Badge>
        </div>
        <p className="text-sm text-white/80">Oszczędzasz do {discountPercent}%!</p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {slots.map((slot, idx) => (
          <div key={idx}>
            <h4 className="text-sm font-semibold text-dark mb-2">
              [{idx + 1}] {slot.label} ({((selections?.[idx])?.length ?? 0)}/{slot.quantity})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {slot.options.map((opt) => {
                const selected = (selections[idx] || []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleSelection(idx, opt.id)}
                    className={cn(
                      'rounded-lg border p-2 text-left text-sm transition-all',
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="font-medium">{opt.name}</span>
                    <span className="block text-xs text-gray-500">{(opt?.price ?? 0).toFixed(2)} zł</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500 line-through">{(original ?? 0).toFixed(2)} zł</span>
              <span className="ml-2 text-2xl font-bold text-primary">{(discounted ?? 0).toFixed(2)} zł</span>
            </div>
            <Button
              disabled={!allFilled}
              onClick={() => onAddBundle(selections)}
              className={cn(!allFilled && 'opacity-50 cursor-not-allowed')}
            >
              Dodaj zestaw do torby
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
