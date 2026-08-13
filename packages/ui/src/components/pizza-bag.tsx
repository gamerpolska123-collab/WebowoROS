'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface PizzaBagProps {
  itemCount: number;
  totalPrice: number;
  onClick?: () => void;
  className?: string;
}

export function PizzaBag({ itemCount, totalPrice, onClick, className }: PizzaBagProps) {
  const state = itemCount === 0 ? 'empty' : itemCount <= 2 ? 'light' : itemCount <= 5 ? 'medium' : 'full';

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300',
        state === 'empty' && 'bg-gray-100 text-gray-500',
        state !== 'empty' && 'bg-primary text-white shadow-lg',
        className
      )}
    >
      {/* Bag SVG icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'transition-transform duration-300',
          state === 'light' && 'scale-105',
          state === 'medium' && 'scale-110',
          state === 'full' && 'scale-125'
        )}
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      <div className="flex flex-col items-start">
        <span className="text-xs font-medium opacity-80">Twoja torba</span>
        <span className="text-sm font-bold tabular-nums">
          {itemCount} {itemCount === 1 ? 'item' : 'itemy'} · {totalPrice.toFixed(2)} zł
        </span>
      </div>

      {state === 'full' && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white animate-bounce">
          +{itemCount - 5}
        </span>
      )}
    </button>
  );
}
