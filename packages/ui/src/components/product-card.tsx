"use client";
import Image from "next/image";

import { Badge } from "./badge";
import { Button } from "./button";
import { Plus } from "lucide-react";

interface ProductCardVariant {
  id: string;
  name: string;
  priceAdjustment: number | string;
}

interface ProductCardBadge {
  id: string;
  badgeType: string;
}

interface ProductCardProduct {
  id: string;
  name: string;
  description?: string;
  basePrice: number | string;
  imageUrl?: string;
  badges?: ProductCardBadge[];
  variants?: ProductCardVariant[];
}

interface ProductCardProps {
  product: ProductCardProduct;
  onAdd?: () => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const basePrice = Number(product.basePrice);
  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => basePrice + Number(v.priceAdjustment)))
    : basePrice;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {product.imageUrl && (
        <div className="relative h-48 bg-neutral-100 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.badges?.map((badge) => (
              <Badge
                key={badge.id}
                variant={badge.badgeType === "bestseller" ? "default" : "secondary"}
                className="text-xs"
              >
                {badge.badgeType === "bestseller" ? "🔥 Bestseller" : badge.badgeType}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-neutral-900 text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-red-600">{(minPrice ?? 0).toFixed(2)} zł</span>
            {product.variants && (product?.variants?.length ?? 0) > 1 && (
              <span className="text-xs text-neutral-400 ml-1">od</span>
            )}
          </div>
          <Button
            onClick={onAdd}
            size="sm"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
