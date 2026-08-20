'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface FreeDeliveryProgressProps {
  currentAmount: number;
  threshold: number;
  className?: string;
}

export function FreeDeliveryProgress({ currentAmount, threshold, className }: FreeDeliveryProgressProps) {
  const percentage = Math.min((currentAmount / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentAmount, 0);
  const achieved = currentAmount >= threshold;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-dark">
          {achieved ? '🔥 DARMOWA DOSTAWA!' : `Twoja torba: ${currentAmount.toFixed(2)} zł`}
        </span>
        <span className="text-sm text-gray-500">
          {achieved ? 'Oszczędzasz 8 zł!' : `Jeszcze ${remaining.toFixed(2)} zł`}
        </span>
      </div>

      {/* Thermometer bar */}
      <div className="relative h-4 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            achieved ? 'bg-accent' : 'bg-secondary'
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Flame icon at threshold */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-lg"
          style={{ left: `calc(${Math.min(percentage, 100)}% - 8px)` }}
        >
          {achieved ? '🔥' : '🍕'}
        </div>
      </div>

      {achieved && (
        <div className="mt-2 text-center text-sm font-semibold text-accent animate-bounce">
          🎉 Gratulacje! Masz darmową dostawę!
        </div>
      )}

      {!achieved && remaining > 0 && remaining <= 15 && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          💡 Dodaj napój 1L za 5 zł i masz darmową dostawę!
        </p>
      )}
    </div>
  );
}
