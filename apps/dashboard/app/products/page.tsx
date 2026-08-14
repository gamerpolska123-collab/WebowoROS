"use client";

import { useState, useCallback } from "react";
import { Button, Input } from "@ros/ui";
import { useProducts, useCategories } from "@/lib/hooks";
import { dashApi } from "@/lib/api";
import { ProductFormData } from "@/lib/product-schema";
import { ProductCard } from "./components/product-card";
import { ProductFormModal } from "./components/product-form-modal";

export default function ProductsPage() {
  const { data: products, loading, error, refetch } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = useCallback((product: any) => {
    setEditingProduct(product);
    setModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingProduct(null);
    setModalOpen(true);
  }, []);

  const handleToggle = useCallback(async (id: string, isAvailable: boolean) => {
    setActionId(id);
    try {
      await dashApi.updateProduct(id, { isAvailable });
      refetch();
    } catch (e: any) {
      alert("Błąd: " + e.message);
    } finally {
      setActionId(null);
    }
  }, [refetch]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Czy na pewno usunąć ten produkt? (deaktywacja)")) return;
    setActionId(id);
    try {
      await dashApi.deleteProduct(id);
      refetch();
    } catch (e: any) {
      alert("Błąd: " + e.message);
    } finally {
      setActionId(null);
    }
  }, [refetch]);

  const handleSubmit = useCallback(async (data: ProductFormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        basePrice: data.basePrice,
        imageUrl: data.imageUrl || null,
      };
      if (editingProduct?.id) {
        await dashApi.updateProduct(editingProduct.id, payload);
      } else {
        await dashApi.createProduct(payload);
      }
      setModalOpen(false);
      refetch();
    } catch (e: any) {
      alert("Błąd zapisu: " + e.message);
    } finally {
      setSaving(false);
    }
  }, [editingProduct, refetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">🍕 Produkty</h2>
        <Button onClick={handleAdd}>+ Dodaj produkt</Button>
      </div>

      <Input
        placeholder="🔍 Szukaj produktu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Błąd: {error}
        </div>
      )}

      {loading && !products ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
              loading={actionId === product.id}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-lg">Brak produktów</p>
          <p className="text-sm">Zmień wyszukiwanie lub dodaj nowy produkt</p>
        </div>
      )}

      <ProductFormModal
        product={editingProduct}
        categories={categories || []}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
