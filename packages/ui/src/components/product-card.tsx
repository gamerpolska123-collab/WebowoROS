'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from './badge';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  badges?: string[];
  isBestseller?: boolean;
  isChefChoice?: boolean;
  isNew?: boolean;
  onAdd: () => void;
  className?: string;
}

export function ProductCard({
  name,
  description,
  price,
  imageUrl,
  badges = [],
  isBestseller,
  isChefChoice,
  isNew,
  onAdd,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {isBestseller && <Badge variant="bestseller">🏆 BESTSELLER</Badge>}
          {isChefChoice && <Badge variant="chef">👨‍🍳 SZEF POLECA</Badge>}
          {isNew && <Badge variant="secondary">✨ NOWOŚĆ</Badge>}
          {badges.map((badge) => (
            <Badge key={badge} variant="outline">{badge}</Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-poppins text-lg font-semibold text-dark">{name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-primary tabular-nums">{price.toFixed(2)} zł</span>
          <button
            onClick={onAdd}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primaryDark active:scale-95"
          >
            🍕 Dodaj
          </button>
        </div>
      </div>
    </div>
  );
}
