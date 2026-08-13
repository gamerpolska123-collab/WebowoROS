'use client';

import { useState } from 'react';
import { Card, CardContent, Badge } from '@ros/ui';

const mockOrders = [
  { id: '#1025', items: ['Margherita 40cm', 'Cola 1L'], time: '2 min', status: 'new', color: 'bg-primary' },
  { id: '#1024', items: ['Capriciosa 40cm', 'Sos czosnkowy'], time: '5 min', status: 'preparing', color: 'bg-secondary' },
  { id: '#1023', items: ['Quattro Formaggi 32cm'], time: '8 min', status: 'ready', color: 'bg-accent' },
  { id: '#1022', items: ['Zestaw Rodzinny'], time: '12 min', status: 'ready', color: 'bg-accent' },
];

export default function KDSPage() {
  const [orders, setOrders] = useState(mockOrders);

  const advanceStatus = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = o.status === 'new' ? 'preparing' : o.status === 'preparing' ? 'ready' : 'done';
        return { ...o, status: next, color: next === 'preparing' ? 'bg-secondary' : next === 'ready' ? 'bg-accent' : 'bg-gray-400' };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">📋 KDS — Kuchnia</h2>
        <div className="flex gap-2">
          <Badge variant="default">🔴 Nowe: {orders.filter((o) => o.status === 'new').length}</Badge>
          <Badge variant="secondary">🟡 W przygotowaniu: {orders.filter((o) => o.status === 'preparing').length}</Badge>
          <Badge variant="chef">🟢 Gotowe: {orders.filter((o) => o.status === 'ready').length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.filter((o) => o.status !== 'done').map((order) => (
          <Card
            key={order.id}
            className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${order.status === 'new' ? 'animate-pulse-border' : ''}`}
            onClick={() => advanceStatus(order.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-lg">{order.id}</span>
                <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${order.color}`}>
                  {order.time}
                </span>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <p key={item} className="text-sm text-gray-700">• {item}</p>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  {order.status === 'new' && '🔴 Kliknij aby rozpocząć'}
                  {order.status === 'preparing' && '🟡 Kliknij gdy gotowe'}
                  {order.status === 'ready' && '🟢 Kliknij aby oznaczyć jako wydane'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
