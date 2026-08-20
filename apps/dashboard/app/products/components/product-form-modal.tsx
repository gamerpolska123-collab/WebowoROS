"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from "@ros/ui";
import { ProductFormSchema, ProductFormData } from "@/lib/product-schema";

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
}

interface Addon {
  id?: string;
  name: string;
  price: number;
  maxQuantity: number;
  isActive: boolean;
}

interface Product {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  tags?: string[];
  allergens?: string[];
  variants?: Variant[];
  addons?: Addon[];
}

interface Props {
  product: Product | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  loading?: boolean;
}

export function ProductFormModal({ product, categories, open, onClose, onSubmit, loading }: Props) {
  const isEdit = !!product?.id;

  const [variants, setVariants] = useState<Array<{ name: string; priceAdjustment: string; isActive: boolean }>>([]);
  const [addons, setAddons] = useState<Array<{ name: string; price: string; maxQuantity: string; isActive: boolean }>>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      imageUrl: "",
      isAvailable: true,
      isFeatured: false,
      categoryId: "",
      tags: [],
      allergens: [],
      variants: [],
      addons: [],
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        imageUrl: product.imageUrl || "",
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        categoryId: product.categoryId,
        tags: product.tags || [],
        allergens: product.allergens || [],
        variants: (product.variants || []).map((v) => ({
          name: v.name,
          priceAdjustment: Number(v.priceAdjustment),
          isActive: v.isActive ?? true,
        })),
        addons: (product.addons || []).map((a) => ({
          name: a.name,
          price: Number(a.price),
          maxQuantity: Number(a.maxQuantity || 1),
          isActive: a.isActive ?? true,
        })),
      });
      setVariants(
        (product.variants || []).map((v) => ({
          name: v.name,
          priceAdjustment: String(v.priceAdjustment),
          isActive: v.isActive ?? true,
        }))
      );
      setAddons(
        (product.addons || []).map((a) => ({
          name: a.name,
          price: String(a.price),
          maxQuantity: String(a.maxQuantity || 1),
          isActive: a.isActive ?? true,
        }))
      );
    } else {
      reset({
        name: "",
        description: "",
        basePrice: 0,
        imageUrl: "",
        isAvailable: true,
        isFeatured: false,
        categoryId: "",
        tags: [],
        allergens: [],
        variants: [],
        addons: [],
      });
      setVariants([]);
      setAddons([]);
    }
  }, [product, reset]);

  const isAvailable = watch("isAvailable");
  const isFeatured = watch("isFeatured");

  const addVariant = () => {
    setVariants([...variants, { name: "", priceAdjustment: "0", isActive: true }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | boolean) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const addAddon = () => {
    setAddons([...addons, { name: "", price: "0", maxQuantity: "1", isActive: true }]);
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  const updateAddon = (index: number, field: string, value: string | boolean) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: value };
    setAddons(updated);
  };

  const handleFormSubmit = (formData: ProductFormData) => {
    const payload: ProductFormData = {
      ...formData,
      variants: variants
        .filter((v) => v.name.trim() !== "")
        .map((v) => ({
          name: v.name.trim(),
          priceAdjustment: Number(v.priceAdjustment) || 0,
          isActive: v.isActive,
        })),
      addons: addons
        .filter((a) => a.name.trim() !== "")
        .map((a) => ({
          name: a.name.trim(),
          price: Number(a.price) || 0,
          maxQuantity: Number(a.maxQuantity) || 1,
          isActive: a.isActive,
        })),
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "✏️ Edytuj produkt" : "➕ Nowy produkt"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Nazwa</label>
            <Input {...register("name")} placeholder="Np. Margherita" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Opis</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition text-sm"
              placeholder="Sos pomidorowy, mozzarella, bazylia..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Cena (zł)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("basePrice", { valueAsNumber: true })}
              />
              {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Kategoria</label>
              <select
                {...register("categoryId")}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm"
              >
                <option value="">Wybierz...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">URL obrazka</label>
            <Input {...register("imageUrl")} placeholder="https://..." />
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setValue("isAvailable", e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm">Dostępny</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setValue("isFeatured", e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm">Wyróżniony</span>
            </label>
          </div>

          {/* ─── Variants Section ─── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Warianty</h4>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                + Dodaj wariant
              </Button>
            </div>
            {variants.map((variant, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <input
                  type="text"
                  placeholder="Nazwa wariantu (np. Duża)"
                  value={variant.name}
                  onChange={(e) => updateVariant(idx, "name", e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <input
                  type="number"
                  placeholder="Dopłata"
                  value={variant.priceAdjustment}
                  onChange={(e) => updateVariant(idx, "priceAdjustment", e.target.value)}
                  className="w-24 px-2 py-1 text-sm border rounded"
                />
                <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(e) => updateVariant(idx, "isActive", e.target.checked)}
                  />
                  Aktywny
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(idx)}>
                  ×
                </Button>
              </div>
            ))}
            {errors.variants && <p className="text-red-500 text-xs">{errors.variants.message}</p>}
          </div>

          {/* ─── Addons Section ─── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Dodatki</h4>
              <Button type="button" variant="outline" size="sm" onClick={addAddon}>
                + Dodaj dodatek
              </Button>
            </div>
            {addons.map((addon, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <input
                  type="text"
                  placeholder="Nazwa dodatku (np. Extra ser)"
                  value={addon.name}
                  onChange={(e) => updateAddon(idx, "name", e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <input
                  type="number"
                  placeholder="Cena"
                  value={addon.price}
                  onChange={(e) => updateAddon(idx, "price", e.target.value)}
                  className="w-20 px-2 py-1 text-sm border rounded"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={addon.maxQuantity}
                  onChange={(e) => updateAddon(idx, "maxQuantity", e.target.value)}
                  className="w-16 px-2 py-1 text-sm border rounded"
                />
                <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={addon.isActive}
                    onChange={(e) => updateAddon(idx, "isActive", e.target.checked)}
                  />
                  Aktywny
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAddon(idx)}>
                  ×
                </Button>
              </div>
            ))}
            {errors.addons && <p className="text-red-500 text-xs">{errors.addons.message}</p>}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj produkt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
