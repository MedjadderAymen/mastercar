"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  accessoryId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  brandName: string;
  modelName: string;
  maxQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (accessoryId: string) => void;
  updateQuantity: (accessoryId: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "car-parts-shop-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.accessoryId === item.accessoryId);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, existing.maxQuantity);
        return prev.map((i) =>
          i.accessoryId === item.accessoryId ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.maxQuantity) }];
    });
  };

  const removeItem = (accessoryId: string) => {
    setItems((prev) => prev.filter((i) => i.accessoryId !== accessoryId));
  };

  const updateQuantity = (accessoryId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.accessoryId === accessoryId
            ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxQuantity)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
