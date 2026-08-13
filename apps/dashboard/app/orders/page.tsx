'use client';

import { useState } from 'react';
import { Card, CardContent, Badge, Input, Button } from '@ros/ui';

const mockOrders = [
  { id: '#1025', customer: 'Marek Zieliński', phone: '500 123 456', address: 'Kwiatowa 12, Warszawa', items: 'Margherita 40cm, Cola 1L', total: 44.00, status: 'new', time: '2 min ago' },
  { id: '#1024', customer: 'Katarzyna Nowak', phone: '501 234 567', address: 'Lipowa 5, Warszawa', items: 'Capriciosa 40cm x2', total: 78.00, status: 'preparing', time: '5 min ago' },
  { id: '#1023', customer: 'Jan Kowalski', phone: '502 345 678', address: 'Dębowa 8, Warszawa', items: 'Quattro Formaggi 32cm, Tiramisu', total: 50.00, status: 'ready', time: '8 min ago' },
  { id: '#1022', customer: 'Anna Wiśniewska', phone: '503 456 789', address: 'Sosnowa 3, Warszawa', items: 'Zestaw Rodzinny', total: 89.00, status: 'delivered', time: '15 min ago' },
  { id: '#1021', customer: 'Piotr Lewandowski', phone: '504 567 890', address: 'Brzozowa 21, Warszawa', items: 'Diavola 40cm, Sprite 0.5L', total: 39.50, status: 'cancelled', time: '20 min ago' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '🔴 Nowe', color: 'text-primary', bg: 'bg-primary/10' },
  preparing: { label: '🟡 W przygotowaniu', color: 'text-secondary', bg: 'bg-secondary/10' },
  ready: { label: '🟢 Gotowe', color: 'text-accent', bg: 'bg-accent/10' },
  delivered: { label: '✅ Dostarczone', color: 'text-gray-500', bg: 'bg-gray-100' },
  cancelled: { label: '❌ Anulowane', color: 'text-danger', bg: 'bg-danger/10' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = orders.filter((o) => {
    const matchesSearch = o.customer.toLowerCase().includes(filter.toLowerCase()) || o.id.includes(filter);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">📦 Zamówienia</h2>
        <div className="flex gap-2">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <Badge
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            >
              {cfg.label}
            </Badge>
          ))}
        </div>
      </div>

      <Input
        placeholder="🔍 Szukaj zamówienia (ID lub klient)..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-md"
      />

      <div className="space-y-3">
        {filtered.map((order) => {
          const cfg = statusConfig[order.status];
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-lg">{order.id}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                    <p className="font-medium text-dark">{order.customer} · {order.phone}</p>
                    <p className="text-sm text-gray-500">📍 {order.address}</p>
                    <p className="text-sm text-gray-600 mt-1">🍕 {order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{order.total.toFixed(2)} zł</p>
                    <div className="flex gap-1 mt-2">
                      {order.status === 'new' && (
                        <Button size="sm" onClick={() => updateStatus(order.id, 'preparing')}>
                          Przyjmij
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(order.id, 'ready')}>
                          Gotowe
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button size="sm" variant="chef" onClick={() => updateStatus(order.id, 'delivered')}>
                          Wydane
                        </Button>
                      )}
                      {(order.status === 'new' || order.status === 'preparing') && (
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, 'cancelled')}>
                          Anuluj
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
