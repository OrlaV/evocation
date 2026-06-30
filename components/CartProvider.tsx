"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* Client-side cart, persisted to localStorage. Lines are keyed by slug+option
   so the same configuration stacks. Prices here are a display snapshot — the
   checkout API always re-reads the authoritative price from the DB. */
export type CartItem = {
  slug: string;
  optionKey?: string;
  qty: number;
  name: string; // product name
  optionLabel?: string; // e.g. "Left side"
  unitPence: number; // snapshot unit price (display only)
  evoNo: string;
  slots: number; // shipping slots this line-unit occupies
  imagePath?: string; // hero image bucket path, for the cart thumbnail
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  count: number;
  subtotalPence: number;
  mounted: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "evocation-cart-v1";
const clampQty = (q: number) => Math.max(1, Math.min(20, Math.round(q) || 1));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, mounted]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const i = prev.findIndex(
        (p) => p.slug === item.slug && p.optionKey === item.optionKey,
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: clampQty(next[i].qty + item.qty) };
        return next;
      }
      return [...prev, { ...item, qty: clampQty(item.qty) }];
    });
  }, []);

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) =>
      prev.map((p, j) => (j === index ? { ...p, qty: clampQty(qty) } : p)),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, j) => j !== index));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotalPence = items.reduce((n, i) => n + i.unitPence * i.qty, 0);

  return (
    <Ctx.Provider
      value={{ items, add, setQty, remove, clear, count, subtotalPence, mounted }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
