'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface LastMinuteItem {
  id: string;
  name: string;
  price: number;
  icon?: string;
}

interface LastMinuteAddonsProps {
  items: LastMinuteItem[];
  onAdd: (itemId: string) => void;
  className?: string;
}

export function LastMinuteAddons({ items, onAdd, className }: LastMinuteAddonsProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💡</span>
        <h4 className="text-sm font-semibold text-dark">Ostatnia szansa!</h4>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAdd(item.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-primary hover:shadow-md transition-all active:scale-95"
          >
            <span className="text-2xl">{item.icon || '🍕'}</span>
            <span className="text-xs font-medium text-dark whitespace-nowrap">{item.name}</span>
            <span className="text-xs font-bold text-primary">+{item.price.toFixed(2)} zł</span>
          </button>
        ))}
      </div>
    </div>
  );
}
