"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/* Empties the cart once an order is confirmed (rendered on /order/success). */
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
