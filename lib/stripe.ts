import Stripe from "stripe";

/* Lazy server-side Stripe client. Returns null when STRIPE_SECRET_KEY is
   absent, so the site runs (and falls back to the NotifyMe CTA) before Stripe
   is configured — same pattern as the Supabase fallback. Server only. */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
