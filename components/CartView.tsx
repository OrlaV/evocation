"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { track } from "@vercel/analytics";
import { formatPrice, type Product } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import {
  shippingPenceForCart,
  packCart,
  type ShipZone,
  type ShippingSettings,
} from "@/lib/shipping";
import { useCart } from "./CartProvider";
import { PartCard } from "./Registry";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export default function CartView({
  shipping,
  allProducts = [],
}: {
  shipping: ShippingSettings;
  allProducts?: Product[];
}) {
  const { items, setQty, remove, subtotalPence, mounted } = useCart();
  const [zone, setZone] = useState<ShipZone>("uk");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // cross-sell: other published parts that fit the same make(s) as the cart
  const suggestions = useMemo(() => {
    if (!allProducts.length || !items.length) return [];
    const inCart = new Set(items.map((i) => i.slug));
    const makes = new Set<string>();
    for (const i of items) {
      const p = allProducts.find((pr) => pr.slug === i.slug);
      p?.fitment.forEach((f) => f.make && makes.add(f.make));
    }
    return allProducts
      .filter(
        (p) => !inCart.has(p.slug) && p.fitment.some((f) => makes.has(f.make)),
      )
      .slice(0, 3);
  }, [allProducts, items]);

  if (!mounted) return <div className="min-h-[40vh]" />;

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="border border-dashed border-ink-soft/65 px-6 py-14 text-center"
      >
        <p className="text-ink-soft">Your cart is empty.</p>
        <Link
          href="/shop"
          className="label-mono chamfer mt-5 inline-block bg-brg px-5 py-3 text-cream transition-colors hover:bg-brg-deep"
        >
          Browse the registry
        </Link>
      </motion.div>
    );
  }

  const packItems = items.map((i) => ({ slots: i.slots, qty: i.qty }));
  const { boxes } = packCart(packItems, shipping.thresholds);
  const shippingCost = shippingPenceForCart(shipping, zone, packItems);
  const total = subtotalPence + shippingCost;

  const checkout = async () => {
    setBusy(true);
    setErr(null);
    track("begin_checkout", { value: total / 100, items: items.length });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            optionKey: i.optionKey,
            qty: i.qty,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data.error ?? "Couldn't start checkout — try again.");
    } catch {
      setErr("Couldn't start checkout — try again.");
    }
    setBusy(false);
  };

  return (
    <>
    <div className="grid grid-cols-1 gap-[clamp(28px,5vw,64px)] min-[861px]:grid-cols-[1.6fr_1fr]">
      {/* line items */}
      <div className="border-t border-hairline">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((it, i) => (
            <motion.div
              key={`${it.slug}-${it.optionKey ?? "base"}`}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="flex gap-4 overflow-hidden border-b border-hairline py-5"
            >
              <div className="hatch h-20 w-24 flex-none overflow-hidden border border-hairline">
                {it.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl(it.imagePath)}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/parts/${it.slug}`}
                    className="font-display text-[1.05rem] font-bold transition-colors hover:text-brg"
                  >
                    {it.name}
                  </Link>
                  <motion.span
                    key={it.unitPence * it.qty}
                    initial={{ opacity: 0.4, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-num text-[1.15rem]"
                  >
                    {formatPrice(it.unitPence * it.qty)}
                  </motion.span>
                </div>
                {it.optionLabel && (
                  <div className="text-[0.88rem] text-ink-soft">
                    {it.optionLabel}
                  </div>
                )}
                <div className="label-mono mt-0.5 !text-[0.64rem] text-brass">
                  {it.evoNo} · {formatPrice(it.unitPence)} each
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center border border-hairline">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(i, it.qty - 1)}
                      className="cursor-pointer px-3 py-1.5 text-ink-soft hover:text-brg"
                    >
                      –
                    </motion.button>
                    <span className="font-num min-w-[2ch] text-center">
                      {it.qty}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(i, it.qty + 1)}
                      className="cursor-pointer px-3 py-1.5 text-ink-soft hover:text-brg"
                    >
                      +
                    </motion.button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="label-mono cursor-pointer !text-[0.66rem] text-ink-soft transition-colors hover:text-brg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* summary */}
      <motion.div
        layout
        className="h-fit border border-hairline bg-cream-card p-6 min-[861px]:sticky min-[861px]:top-24"
      >
        <div className="label-mono mb-4 !text-[0.7rem] !tracking-[0.14em] text-ink-soft">
          Order summary
        </div>

        <div className="flex justify-between py-1.5 text-[0.92rem]">
          <span className="text-ink-soft">Subtotal</span>
          <span className="font-num text-[1.05rem]">
            {formatPrice(subtotalPence)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 py-1.5 text-[0.92rem]">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as ShipZone)}
            aria-label="Shipping destination"
            className="cursor-pointer border-b border-hairline bg-transparent text-ink-soft outline-none focus:border-brg"
          >
            {shipping.zones.map((z) => (
              <option key={z.key} value={z.key}>
                Shipping — {z.label}
              </option>
            ))}
          </select>
          <motion.span
            key={shippingCost}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="font-num text-[1.05rem]"
          >
            {formatPrice(shippingCost)}
          </motion.span>
        </div>
        {boxes > 1 && (
          <div className="label-mono !text-[0.6rem] text-ink-soft/70">
            Ships in {boxes} boxes
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-between border-t border-hairline pt-3">
          <span className="font-semibold">Total</span>
          <motion.span
            key={total}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-num text-[1.6rem]"
          >
            {formatPrice(total)}
          </motion.span>
        </div>
        <div className="label-mono mt-1 !text-[0.62rem] text-ink-soft/70">
          VAT included · region confirmed at checkout
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={checkout}
          disabled={busy}
          className="label-mono chamfer mt-5 w-full cursor-pointer bg-brg px-[26px] py-4 font-bold text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {busy ? "Taking you to checkout…" : "Checkout"}
        </motion.button>
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="label-mono mt-2.5 !text-[0.66rem] !tracking-[0.1em] text-brg"
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="label-mono mt-3 !text-[0.64rem] !tracking-[0.08em] text-ink-soft">
          Printed to order · Worldwide from the UK ·{" "}
          <span className="text-brg">Fits or refunded</span>
        </div>
      </motion.div>
    </div>

    {/* cross-sell — other parts that fit the same car(s) */}
    {suggestions.length > 0 && (
      <div className="mt-[clamp(40px,6vw,72px)]">
        <div className="label-mono mb-6 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
          You may also need
        </div>
        <div className="grid grid-cols-2 gap-[clamp(8px,1.4vw,18px)] min-[861px]:grid-cols-3">
          {suggestions.map((p, i) => (
            <PartCard key={p.evo_no} part={p} index={i} compact />
          ))}
        </div>
      </div>
    )}
    </>
  );
}
