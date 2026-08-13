import * as React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'gold' | 'chef' | 'bestseller';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        {
          'border-transparent bg-primary text-white hover:bg-primary/80': variant === 'default',
          'border-transparent bg-secondary text-white hover:bg-secondary/80': variant === 'secondary',
          'border-transparent bg-danger text-white hover:bg-danger/80': variant === 'destructive',
          'border-gray-200 bg-white text-gray-900 hover:bg-gray-100': variant === 'outline',
          'border-transparent bg-gold text-white hover:bg-gold/80': variant === 'gold',
          'border-transparent bg-accent text-white hover:bg-accent/80': variant === 'chef',
          'border-transparent bg-dark text-white hover:bg-dark/80': variant === 'bestseller',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
