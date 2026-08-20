'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface FlyToBagProps {
  startRef: React.RefObject<HTMLElement>;
  endRef: React.RefObject<HTMLElement>;
  imageUrl?: string;
  onComplete?: () => void;
}

export function FlyToBag({ startRef, endRef, imageUrl, onComplete }: FlyToBagProps) {
  const [flying, setFlying] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const trigger = React.useCallback(() => {
    if (!startRef.current || !endRef.current) return;

    const start = startRef.current.getBoundingClientRect();
    const end = endRef.current.getBoundingClientRect();

    const startX = start.left + start.width / 2;
    const startY = start.top + start.height / 2;
    const endX = end.left + end.width / 2;
    const endY = end.top + end.height / 2;

    setPosition({ x: startX, y: startY });
    setFlying(true);

    // Animate to end position
    requestAnimationFrame(() => {
      setPosition({ x: endX, y: endY });
    });

    setTimeout(() => {
      setFlying(false);
      onComplete?.();
    }, 700);
  }, [startRef, endRef, onComplete]);

  if (!flying) return null;

  return (
    <div
      className={cn(
        'fixed z-[9999] pointer-events-none',
        'w-16 h-16 rounded-full overflow-hidden shadow-xl'
      )}
      style={{
        left: position.x - 32,
        top: position.y - 32,
        transition: 'all 700ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: flying ? 'scale(0.3) rotate(360deg)' : 'scale(1) rotate(0deg)',
        opacity: flying ? 0 : 1,
      }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary text-white text-2xl">
          🍕
        </div>
      )}
    </div>
  );
}
