"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Button, Badge, AddonConfigurator } from "@weboworos/ui";
import { Plus, Minus, X } from "lucide-react";

interface PizzaBuilderProps {
  product: any;
  onAddToCart?: () => void;
}

export default function PizzaBuilder({ product, onAddToCart }: PizzaBuilderProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<any>(product.variants?.[0] || null);
  const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; quantity: number }[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const unitPrice = Number(product.basePrice) + (selectedVariant ? Number(selectedVariant.priceAdjustment) : 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => {
    const addon = product.addons?.find((ad: any) => ad.id === a.addonId);
    return sum + (addon ? Number(addon.price) * a.quantity : 0);
  }, 0);
  const itemTotal = (unitPrice + addonsTotal) * quantity;

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addonId);
      if (exists) {
        return prev.filter((a) => a.addonId !== addonId);
      }
      return [...prev, { addonId, quantity: 1 }];
    });
  };

  const handleAddonQuantity = (addonId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedAddons((prev) => prev.filter((a) => a.addonId !== addonId));
      return;
    }
    setSelectedAddons((prev) => prev.map((a) => (a.addonId === addonId ? { ...a, quantity: qty } : a)));
  };

  const handleAdd = () => {
    const addons = selectedAddons.map((a) => {
      const addon = product.addons?.find((ad: any) => ad.id === a.addonId);
      return {
        addonId: a.addonId,
        name: addon?.name || "Dodatek",
        price: Number(addon?.price || 0),
        quantity: a.quantity,
      };
    });

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      addons,
      quantity,
      unitPrice,
      notes: notes || undefined,
    });

    onAddToCart?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {product.imageUrl && (
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
            <Image src={product.imageUrl} alt={product.name} width={96} height={96} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-neutral-900">{product.name}</h2>
          <p className="text-sm text-neutral-500 mt-1">{product.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.badges?.map((badge: any) => (
              <Badge key={badge.id} variant={badge.badgeType === "bestseller" ? "default" : "secondary"}>
                {badge.badgeType}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Variants */}
      {product.variants?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Wybierz wariant</h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition ${
                  selectedVariant?.id === variant.id
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {variant.name}
                {Number(variant.priceAdjustment) > 0 && (
                  <span className="ml-1 text-red-600">+{Number(variant.priceAdjustment).toFixed(2)} zł</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Addons */}
      {product.addons?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Dodatki</h3>
          <div className="space-y-2">
            {product.addons.map((addon: any) => {
              const selected = selectedAddons.find((a) => a.addonId === addon.id);
              return (
                <div
                  key={addon.id}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${
                    selected ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  onClick={() => handleAddonToggle(addon.id)}
                >
                  <div>
                    <p className="font-medium text-neutral-900">{addon.name}</p>
                    <p className="text-sm text-red-600 font-semibold">+{Number(addon.price).toFixed(2)} zł</p>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleAddonQuantity(addon.id, selected.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{selected.quantity}</span>
                      <button
                        onClick={() => handleAddonQuantity(addon.id, selected.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
                        disabled={selected.quantity >= addon.maxQuantity}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Uwagi (opcjonalnie)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition resize-none text-sm"
          placeholder="Np. bez pieczarek, cienkie ciasto..."
        />
      </div>

      {/* Quantity + Add */}
      <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-bold text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <Button onClick={handleAdd} className="flex-1 py-6 text-lg font-bold rounded-full">
          Dodaj do torby — {itemTotal.toFixed(2)} zł
        </Button>
      </div>
    </div>
  );
}
