"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from "@ros/ui";
import { ProductFormSchema, ProductFormData } from "@/lib/product-schema";

interface Category {
  id: string;
  name: string;
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
      });
    } else {
      reset();
    }
  }, [product, reset]);

  const isAvailable = watch("isAvailable");
  const isFeatured = watch("isFeatured");

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "✏️ Edytuj produkt" : "➕ Nowy produkt"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* TODO: Zarządzanie wariantami i dodatkami — osobny modal lub sekcja */}
          <div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-700">
            💡 Zarządzanie wariantami i dodatkami produktu — w przygotowaniu (Etap 4+)
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
