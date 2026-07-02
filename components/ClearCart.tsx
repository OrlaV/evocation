"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { useCart } from "./CartProvider";

/* Empties the cart once an order is confirmed (rendered on /order/success) and
   fires the `purchase` conversion event. `valuePence` is the order total.
   The event is deduped per Stripe session so a page reload doesn't count a
   second conversion. */
export default function ClearCart({
  valuePence,
  sessionId,
}: {
  valuePence?: number | null;
  sessionId?: string | null;
}) {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    const key = `evocation-purchase-${sessionId ?? "unknown"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — fire anyway */
    }
    track("purchase", { value: (valuePence ?? 0) / 100 });
    // fire once on confirmation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);
  return null;
}
