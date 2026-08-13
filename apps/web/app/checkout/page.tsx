'use client';

import { useState } from 'react';
import { CheckoutTimeline, Button, Input, Card, CardContent, LastMinuteAddons } from '@ros/ui';

const lastMinuteItems = [
  { id: 'l1', name: 'Sos czosnkowy', price: 3.00, icon: '🧄' },
  { id: 'l2', name: 'Oliwki', price: 2.00, icon: '🫒' },
  { id: 'l3', name: 'Cola 0.5L', price: 3.50, icon: '🥤' },
  { id: 'l4', name: 'Deser', price: 8.00, icon: '🍰' },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [bagTotal, setBagTotal] = useState(86);

  const addLastMinute = (id: string) => {
    const item = lastMinuteItems.find((i) => i.id === id);
    if (item) setBagTotal((prev) => prev + item.price);
  };

  return (
    <main className="min-h-screen bg-light py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-poppins text-3xl font-bold text-dark mb-8 text-center">Zamówienie</h1>

        <CheckoutTimeline currentStep={step} className="mb-10" />

        {/* Step 1: Bag summary */}
        {step === 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">🍕 Podsumowanie</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Margherita 40cm + Extra ser, Pieczarki</span>
                    <span className="font-semibold">47.00 zł</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capriciosa 40cm</span>
                    <span className="font-semibold">39.00 zł</span>
                  </div>
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
                  <span>Razem</span>
                  <span className="text-primary">{bagTotal.toFixed(2)} zł</span>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full" onClick={() => setStep(1)}>
              Dalej → Dane dostawy
            </Button>
          </div>
        )}

        {/* Step 2: Delivery details + Last Minute Addons */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">📋 Dane dostawy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Imię" />
                  <Input placeholder="Nazwisko" />
                </div>
                <Input placeholder="Telefon" type="tel" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="Ulica" />
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Nr budynku" />
                  <Input placeholder="Mieszkanie" />
                  <Input placeholder="Kod pocztowy" />
                </div>
                <Input placeholder="Miasto" />
                <textarea
                  placeholder="Uwagi do zamówienia..."
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </CardContent>
            </Card>

            {/* Last Minute Addons — docs/ui-ux.md sekcja 3.4 */}
            <Card>
              <CardContent className="p-6">
                <LastMinuteAddons items={lastMinuteItems} onAdd={addLastMinute} />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                ← Wstecz
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Dalej → Płatność
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">💳 Płatność</h3>
                <div className="space-y-3">
                  {['Karta płatnicza (Stripe)', 'BLIK (PayU)', 'Gotówka przy odbiorze'].map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-primary transition-colors"
                    >
                      <input type="radio" name="payment" className="h-4 w-4 text-primary" />
                      <span className="font-medium">{method}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Do zapłaty</span>
                    <span className="text-primary">{bagTotal.toFixed(2)} zł</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                ← Wstecz
              </Button>
              <Button className="flex-1 bg-accent hover:bg-accentLight">
                Zamów i zapłać →
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
