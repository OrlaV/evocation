import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "./stripe";

/* Keep a Stripe Customer per account, synced with the saved profile address, so
   Checkout can prefill the buyer's details and remember new addresses. */

export type ProfileForStripe = {
  full_name?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_postal_code?: string | null;
  address_country?: string | null;
  stripe_customer_id?: string | null;
};

function toStripeAddress(p: ProfileForStripe) {
  // a partial address is worse than none for prefill — require the essentials
  if (!p.address_line1 || !p.address_postal_code || !p.address_country) return null;
  return {
    line1: p.address_line1,
    line2: p.address_line2 || undefined,
    city: p.address_city || undefined,
    state: p.address_state || undefined,
    postal_code: p.address_postal_code,
    country: p.address_country,
  };
}

// Returns the Stripe Customer id (creating/updating as needed), or null when
// Stripe is off. Persists a freshly-created id back to profiles via `svc`.
export async function ensureStripeCustomer(
  svc: SupabaseClient,
  userId: string,
  email: string,
  profile: ProfileForStripe,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const address = toStripeAddress(profile);
  const name = profile.full_name || undefined;
  const phone = profile.phone || undefined;
  const params = {
    email,
    name,
    phone,
    ...(address
      ? { address, shipping: { name: name || email, address, phone } }
      : {}),
  };

  let id = profile.stripe_customer_id || null;
  if (id) {
    try {
      await stripe.customers.update(id, params);
      return id;
    } catch {
      id = null; // stale id (deleted in Stripe) → recreate below
    }
  }
  const created = await stripe.customers.create(params);
  await svc
    .from("profiles")
    .update({ stripe_customer_id: created.id })
    .eq("user_id", userId);
  return created.id;
}
