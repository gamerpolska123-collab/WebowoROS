'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Badge, Input } from '@ros/ui';

const mockProducts = [
  { id: '1', name: 'Margherita', price: 29, category: 'Pizze', isActive: true, isBestseller: true },
  { id: '2', name: 'Capriciosa', price: 35, category: 'Pizze', isActive: true, isBestseller: true },
  { id: '3', name: 'Quattro Formaggi', price: 38, category: 'Pizze', isActive: true, isBestseller: false },
  { id: '4', name: 'Coca-Cola 1L', price: 5, category: 'Napoje', isActive: true, isBestseller: false },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">🍕 Produkty</h2>
        <Button>+ Dodaj produkt</Button>
      </div>

      <Input
        placeholder="🔍 Szukaj produktu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className={!product.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-dark">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="flex gap-1">
                  {product.isBestseller && <Badge variant="bestseller">🏆</Badge>}
                  <Badge variant={product.isActive ? 'default' : 'outline'}>
                    {product.isActive ? 'Aktywny' : 'Ukryty'}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-primary">{product.price.toFixed(2)} zł</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edytuj</Button>
                  <Button
                    variant={product.isActive ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => toggleActive(product.id)}
                  >
                    {product.isActive ? 'Ukryj' : 'Pokaż'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
