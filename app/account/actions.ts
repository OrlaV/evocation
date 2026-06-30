"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/customer-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { ensureStripeCustomer } from "@/lib/stripe-customer";

export type ProfilePayload = {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  address_country?: string;
  marketing_opt_in?: boolean;
};

const clean = (v: unknown, n: number) =>
  typeof v === "string" ? v.trim().slice(0, n) : "";

/* Save the customer's profile. Writes a whitelisted payload via the service
   role (so stripe_customer_id can't be spoofed), then syncs the Stripe
   Customer for checkout prefill. */
export async function saveProfileAction(
  p: ProfilePayload,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const svc = createServiceClient();

  const row = {
    user_id: user.id,
    full_name: clean(p.full_name, 120) || null,
    phone: clean(p.phone, 40) || null,
    address_line1: clean(p.address_line1, 200) || null,
    address_line2: clean(p.address_line2, 200) || null,
    address_city: clean(p.address_city, 120) || null,
    address_state: clean(p.address_state, 120) || null,
    address_postal_code: clean(p.address_postal_code, 30) || null,
    address_country: clean(p.address_country, 2).toUpperCase() || null,
    marketing_opt_in: Boolean(p.marketing_opt_in),
    updated_at: new Date().toISOString(),
  };
  const { error } = await svc
    .from("profiles")
    .upsert(row, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  // best-effort Stripe Customer sync (never block the save on it)
  try {
    const { data: prof } = await svc
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (prof && user.email) {
      await ensureStripeCustomer(svc, user.id, user.email, prof);
    }
  } catch (e) {
    console.error("stripe customer sync:", (e as Error).message);
  }

  revalidatePath("/account/profile");
  return { ok: true };
}

/* Delete the account (GDPR). Orders/queue/donor rows keep their history with
   user_id set to null; the profile cascades. */
export async function deleteAccountAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await requireUser();
  const svc = createServiceClient();
  const { error } = await svc.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
