"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/currency";

/* Display currency preference (GBP/EUR/USD), persisted to localStorage.
   Affects approximate price hints only — checkout is always GBP. */
type Ctx = {
  code: CurrencyCode;
  setCode: (c: CurrencyCode) => void;
  mounted: boolean;
};
const CurrencyCtx = createContext<Ctx | null>(null);
const KEY = "evocation-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [code, setCodeState] = useState<CurrencyCode>("GBP");
  const [mounted, setMounted] = useState(false);

  // hydrate the saved preference after mount (localStorage is client-only);
  // the setState here is the intended localStorage-hydration pattern.
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as CurrencyCode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && CURRENCY_CODES.includes(saved)) setCodeState(saved);
    setMounted(true);
  }, []);

  const setCode = useCallback((c: CurrencyCode) => {
    setCodeState(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <CurrencyCtx.Provider value={{ code, setCode, mounted }}>
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency(): Ctx {
  const c = useContext(CurrencyCtx);
  if (!c) throw new Error("useCurrency must be used within CurrencyProvider");
  return c;
}
