'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge } from '@ros/ui';

const steps = [
  { id: 'confirmed', label: 'Przyjęto', icon: '👨‍🍳', description: 'Zamówienie zostało przyjęte do realizacji' },
  { id: 'preparing', label: 'W przygotowaniu', icon: '🔥', description: 'Kucharze przygotowują Twoje dania' },
  { id: 'ready', label: 'Gotowe', icon: '📦', description: 'Zamówienie czeka na kierowcę' },
  { id: 'out_for_delivery', label: 'W drodze', icon: '🛵', description: 'Kierowca jest w drodze do Ciebie' },
  { id: 'delivered', label: 'Dostarczone', icon: '🏠', description: 'Smacznego!' },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TrackPage({ params }: { params: { orderId: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState('19:45');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-light py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-bold text-dark">📍 Śledzenie zamówienia</h1>
          <p className="text-gray-500 mt-2">Zamówienie #{params.orderId || 'ZAM-20240813-001'}</p>
        </div>

        <div className="flex justify-center mb-8">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {steps[currentStep].icon} {steps[currentStep].label}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
                <div
                  className="absolute top-0 left-0 w-full bg-accent transition-all duration-1000"
                  style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="space-y-6">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isActive = idx === currentStep;
                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 transition-all duration-500',
                          isCompleted ? 'bg-accent text-white' : 'bg-gray-200 text-gray-400',
                          isActive && 'ring-4 ring-accent/30 scale-110'
                        )}
                      >
                        {isCompleted && idx < currentStep ? '✓' : step.icon}
                      </div>
                      <div className={cn('pt-1', !isCompleted && 'opacity-50')}>
                        <h3 className={cn('font-semibold', isActive ? 'text-accent' : 'text-dark')}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {isActive && (
                          <p className="text-sm text-primary mt-1 animate-pulse">
                            ⏱️ Szacowany czas dostawy: {estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">🍕 Twoje zamówienie</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Margherita 40cm + Extra ser</span>
                <span className="font-semibold">47.00 zł</span>
              </div>
              <div className="flex justify-between">
                <span>Capriciosa 40cm</span>
                <span className="font-semibold">39.00 zł</span>
              </div>
              <div className="flex justify-between">
                <span>Dostawa</span>
                <span className="text-accent font-semibold">DARMOWA 🔥</span>
              </div>
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
              <span>Razem</span>
              <span className="text-primary">86.00 zł</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
