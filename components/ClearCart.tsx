"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { useCart } from "./CartProvider";

/* Empties the cart once an order is confirmed (rendered on /order/success) and
   fires the `purchase` conversion event. `valuePence` is the order total. */
export default function ClearCart({ valuePence }: { valuePence?: number | null }) {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    track("purchase", { value: (valuePence ?? 0) / 100 });
    // fire once on confirmation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);
  return null;
}
