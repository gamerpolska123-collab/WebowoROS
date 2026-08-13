'use client';

import * as React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Card, CardContent } from './card';

interface UpsellItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  recommendations: UpsellItem[];
  onAdd: (itemId: string) => void;
  onSkip: () => void;
}

export function UpsellModal({ open, onClose, productName, recommendations, onAdd, onSkip }: UpsellModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">🍕 {productName} dodana do torby!</DialogTitle>
        <DialogDescription className="text-center">
          Klienci często dokupują do tego:
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-3 py-4">
        {recommendations.map((item) => (
          <Card key={item.id} className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
            <CardContent className="p-3 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl mb-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  '🥤'
                )}
              </div>
              <p className="text-xs font-medium text-dark">{item.name}</p>
              <p className="text-sm font-bold text-primary">{item.price.toFixed(2)} zł</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() => onAdd(item.id)}
              >
                + Dodaj
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onSkip}>
          Nie, dzięki → Przejdź do torby
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
