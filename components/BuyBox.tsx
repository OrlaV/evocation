"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { track } from "@vercel/analytics";
import { formatPrice, type PurchaseOption } from "@/lib/types";
import { approxPrice } from "@/lib/currency";
import { useCart } from "./CartProvider";
import { useCurrency } from "./CurrencyProvider";
import NotifyMe from "./NotifyMe";

/* Buy box — picks a purchase option (left / right / pair / set) and quantity,
   then adds it to the cart. Shipping & checkout happen on the cart page. When
   Stripe isn't configured it falls back to the NotifyMe order-intent CTA. */
export default function BuyBox({
  slug,
  evoNo,
  productName,
  basePrice,
  primaryRef,
  usedPriceNote,
  leadTimeDays,
  options,
  refLabels,
  productSlots,
  heroImage,
  checkoutEnabled,
}: {
  slug: string;
  evoNo: string;
  productName: string;
  basePrice: number;
  primaryRef: string;
  usedPriceNote: string | null;
  leadTimeDays: number;
  options: PurchaseOption[];
  refLabels: Record<string, string>;
  productSlots: number;
  heroImage?: string;
  checkoutEnabled: boolean;
}) {
  const { add } = useCart();
  const { code, mounted } = useCurrency();
  const hasOptions = options.length > 0;
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const active = hasOptions ? options[sel] : null;
  const price = active ? active.price_pence : basePrice;
  const slots = active?.slots ?? productSlots;

  const addToCart = () => {
    add({
      slug,
      optionKey: active?.key,
      qty,
      name: productName,
      optionLabel: active?.label,
      unitPence: price,
      evoNo,
      slots,
      imagePath: heroImage,
    });
    track("add_to_cart", {
      evo: evoNo,
      option: active?.key ?? "",
      value: (price * qty) / 100,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 4000);
  };

  // "2× Left side · 1× 928.521.148.02"
  const included = active
    ? active.items
        .map((it) => `${it.qty}× ${refLabels[it.ref] ?? it.ref}`)
        .join(" · ")
    : null;

  const partLabel = active
    ? `Order interest — ${evoNo} · ${active.label} [${active.items
        .map((it) => `${it.qty}×${it.ref}`)
        .join(", ")}]`
    : `Order interest — ${evoNo} (${primaryRef})`;

  return (
    <>
    <div className="border-t border-hairline pt-6">
      {hasOptions && (
        <div className="mb-5">
          <div className="label-mono mb-2 !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
            Choose your configuration
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((o, i) => (
              <motion.button
                key={o.key || i}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => {
                  setSel(i);
                  setAdded(false);
                }}
                aria-pressed={i === sel}
                className={`chamfer cursor-pointer border px-3.5 py-2.5 text-left transition-colors ${
                  i === sel
                    ? "border-brg bg-brg/8"
                    : "border-hairline hover:border-ink-soft"
                }`}
              >
                <span className="block text-[0.9rem] font-semibold text-ink">
                  {o.label}
                </span>
                <span className="font-num text-[1.05rem] leading-none text-ink-soft">
                  {formatPrice(o.price_pence)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-3">
        <span className="font-num text-[2.6rem] leading-none">
          {formatPrice(price)}
        </span>
        {mounted && code !== "GBP" && (
          <span className="label-mono !text-[0.66rem] text-ink-soft">
            ≈ {approxPrice(price, code)}
          </span>
        )}
        {usedPriceNote && (
          <span className="text-[0.88rem] text-ink-soft">
            Used originals fetch {usedPriceNote} — worn.
          </span>
        )}
      </div>
      {mounted && code !== "GBP" && (
        <div className="label-mono mt-1 !text-[0.6rem] text-ink-soft/70">
          Charged in GBP · {code} shown as an approximate guide
        </div>
      )}

      {included && (
        <div className="mt-2 font-mono text-[0.76rem] tracking-[0.04em] text-ink-soft">
          Includes: {included}
        </div>
      )}

      {checkoutEnabled ? (
        <>
          <div className="mt-5 flex items-stretch gap-3">
            {/* quantity stepper */}
            <div className="flex items-center border border-hairline">
              <motion.button
                whileTap={{ scale: 0.85 }}
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="cursor-pointer px-3.5 py-3 text-ink-soft hover:text-brg"
              >
                –
              </motion.button>
              <span className="font-num min-w-[2ch] text-center text-[1.05rem]">
                {qty}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                className="cursor-pointer px-3.5 py-3 text-ink-soft hover:text-brg"
              >
                +
              </motion.button>
            </div>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addToCart}
              className="label-mono chamfer flex-1 cursor-pointer bg-brg px-[26px] py-4 font-bold text-cream transition-colors duration-200 hover:bg-brg-deep"
            >
              Add to cart
            </motion.button>
          </div>
          <AnimatePresence>
            {added && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="label-mono mt-2.5 flex items-center gap-2 !text-[0.68rem] !tracking-[0.1em] text-brg"
              >
                Added to cart
                <Link href="/cart" className="underline hover:text-brg-deep">
                  View cart →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <NotifyMe partLabel={partLabel} />
      )}

      <div className="label-mono mt-3 flex flex-wrap gap-x-5 gap-y-1 !text-[0.68rem] !tracking-[0.1em] text-ink-soft">
        <span>Ships in {leadTimeDays} days</span>
        <span>Worldwide from the UK</span>
        <span className="text-brg">Fits or refunded</span>
      </div>
    </div>

    {/* sticky mobile buy bar — keeps price + CTA reachable while scrolling the
        long product page. Mirrors the selected option/quantity. Desktop hides
        it (the buy box sits in the fixed right column ≥981px). */}
    {checkoutEnabled && (
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-hairline bg-[color-mix(in_srgb,var(--cream)_94%,transparent)] px-4 py-3 backdrop-blur-md min-[981px]:hidden">
        <div className="flex flex-col">
          <span className="font-num text-[1.4rem] leading-none">
            {formatPrice(price)}
          </span>
          {active && (
            <span className="label-mono !text-[0.56rem] !tracking-[0.1em] text-ink-soft">
              {active.label}
            </span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={addToCart}
          className="label-mono chamfer ml-auto flex-1 cursor-pointer bg-brg px-5 py-3.5 font-bold text-cream transition-colors hover:bg-brg-deep"
        >
          {added ? "Added to cart ✓" : "Add to cart"}
        </motion.button>
      </div>
    )}
    </>
  );
}
