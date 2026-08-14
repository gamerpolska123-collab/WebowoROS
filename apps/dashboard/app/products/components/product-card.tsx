"use client";

import { Card, CardContent, Button, Badge } from "@ros/ui";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  category?: Category;
  tags?: string[];
}

interface Props {
  product: Product;
  onEdit: (p: Product) => void;
  onToggle: (id: string, available: boolean) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function ProductCard({ product, onEdit, onToggle, onDelete, loading }: Props) {
  return (
    <Card className={!product.isAvailable ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover bg-neutral-100"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl">🍕</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
                <p className="text-xs text-neutral-400">{product.category?.name || "Bez kategorii"}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {product.isFeatured && <Badge variant="secondary">⭐</Badge>}
                <Badge variant={product.isAvailable ? "default" : "outline"}>
                  {product.isAvailable ? "Aktywny" : "Ukryty"}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {product.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-red-600">{Number(product.basePrice).toFixed(2)} zł</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(product)} disabled={loading}>
              Edytuj
            </Button>
            <Button
              variant={product.isAvailable ? "destructive" : "default"}
              size="sm"
              onClick={() => onToggle(product.id, !product.isAvailable)}
              disabled={loading}
            >
              {product.isAvailable ? "Ukryj" : "Pokaż"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(product.id)} disabled={loading}>
              🗑️
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
