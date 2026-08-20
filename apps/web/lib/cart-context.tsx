'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './auth-context';

export interface CartItem {
  productId: string;
  name: string;
  imageUrl?: string;
  basePrice: number;
  variantId?: string;
  variantName?: string;
  variantPriceAdjustment?: number;
  addons: { addonId: string; name: string; price: number; quantity: number }[];
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  freeDeliveryThreshold: number;
  deliveryCost: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CART_STORAGE_KEY = 'weboworos_cart';
const FREE_DELIVERY_THRESHOLD = 50;

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const variantPrice = item.variantPriceAdjustment || 0;
    const addonsPrice = item.addons.reduce((a, addon) => a + addon.price * addon.quantity, 0);
    const unitPrice = item.basePrice + variantPrice + addonsPrice;
    return sum + unitPrice * item.quantity;
  }, 0);
  const deliveryCost = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 9.99;
  const total = subtotal + deliveryCost;
  return { totalItems, subtotal, deliveryCost, total };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  // Load cart from API when user logs in
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    api.get('/orders/cart')
      .then((res) => {
        if (cancelled) return;
        if (res.data?.items?.length > 0) {
          // Merge server cart with local cart (server wins)
          setItems(res.data.items);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // User might not have a cart yet — keep localStorage cart
        if (!err.response) {
          console.warn('[Cart] API unreachable during cart load');
        }
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Sync with API when cart changes (for authenticated users)
  useEffect(() => {
    if (!isAuthenticated || isLoading || items.length === 0) return;

    let cancelled = false;
    const timeout = setTimeout(() => {
      api.post('/orders/cart/sync', { items })
        .catch((err) => {
          if (cancelled) return;
          if (!err.response) {
            console.warn('[Cart] API unreachable during cart sync');
          } else {
            console.error('Cart sync failed:', err);
          }
        });
    }, 500); // Debounce 500ms

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [items, isAuthenticated, isLoading]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const quantity = newItem.quantity || 1;
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId &&
          JSON.stringify(item.addons.map((a) => a.addonId).sort()) ===
          JSON.stringify(newItem.addons.map((a) => a.addonId).sort())
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prev, { ...newItem, quantity }];
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totals = calculateTotals(items);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems: totals.totalItems,
        subtotal: totals.subtotal,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        deliveryCost: totals.deliveryCost,
        total: totals.total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
