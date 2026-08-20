'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface Step {
  id: string;
  label: string;
  icon: string;
}

const steps: Step[] = [
  { id: 'bag', label: 'Torba', icon: '🍕' },
  { id: 'details', label: 'Dane', icon: '📋' },
  { id: 'payment', label: 'Płatność', icon: '💳' },
];

interface CheckoutTimelineProps {
  currentStep: number;
  className?: string;
}

export function CheckoutTimeline({ currentStep, className }: CheckoutTimelineProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const isLast = idx === (steps?.length ?? 0) - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all duration-300',
                    isCompleted && 'border-accent bg-accent text-white',
                    isActive && 'border-primary bg-primary text-white scale-110 shadow-lg',
                    !isActive && !isCompleted && 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isActive ? 'text-primary' : isCompleted ? 'text-accent' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-accent transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
