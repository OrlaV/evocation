"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/customer-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { ensureStripeCustomer } from "@/lib/stripe-customer";
import { resolveMake, resolveModel, vehicleKey } from "@/lib/vehicles";
import { sendEmail, emailConfigured, escapeHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

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

/* ---------- My Garage ---------- */

export async function addGarageVehicleAction(input: {
  make: string;
  model: string;
  year?: string;
  hand?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const make = resolveMake(clean(input.make, 60));
  const model = resolveModel(make, clean(input.model, 80));
  if (!make || !model) return { ok: false, error: "Pick a make and model." };
  const key = vehicleKey(make, model);
  if (!key) return { ok: false, error: "Couldn't identify that vehicle." };
  const yearNum = Number(clean(input.year, 4));
  const year = Number.isFinite(yearNum) && yearNum > 1900 && yearNum < 2100 ? yearNum : null;
  const hand = input.hand === "LHD" || input.hand === "RHD" ? input.hand : null;

  const svc = createServiceClient();
  const { error } = await svc.from("garage_vehicles").upsert(
    { user_id: user.id, make, model, year, hand, vehicle_key: key },
    { onConflict: "user_id,vehicle_key", ignoreDuplicates: true },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/profile");
  return { ok: true };
}

export async function removeGarageVehicleAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const svc = createServiceClient();
  // scope the delete to the owner so an id from another account is a no-op
  const { error } = await svc
    .from("garage_vehicles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/profile");
  return { ok: true };
}

/* ---------- Returns (self-service "fits or refunded") ---------- */

const RETURN_REASONS = ["doesn't fit", "faulty", "other"];

export async function createReturnAction(input: {
  orderId: string;
  reason: string;
  details?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const reason = RETURN_REASONS.includes(input.reason) ? input.reason : "other";
  const details = clean(input.details, 1000) || null;
  const svc = createServiceClient();

  // the order must belong to this account (by user_id or matching email)
  const { data: order } = await svc
    .from("orders")
    .select("id, order_no, user_id, email, status")
    .eq("id", input.orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };
  const owns =
    order.user_id === user.id ||
    (order.email && user.email && order.email.toLowerCase() === user.email.toLowerCase());
  if (!owns) return { ok: false, error: "That order isn't on your account." };

  // one open return per order
  const { data: existing } = await svc
    .from("return_requests")
    .select("id")
    .eq("order_id", order.id)
    .eq("status", "open")
    .maybeSingle();
  if (existing) return { ok: false, error: "A return is already open for this order." };

  const { error } = await svc.from("return_requests").insert({
    order_id: order.id,
    user_id: user.id,
    email: user.email ?? order.email ?? null,
    reason,
    details,
  });
  if (error) return { ok: false, error: error.message };

  // acknowledge to the customer + alert the shop owner (best-effort, inert
  // until Resend is configured)
  if (emailConfigured()) {
    const orderNo = order.order_no ? `O-${String(order.order_no).padStart(4, "0")}` : "your order";
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: `Evocation — return request received (${orderNo})`,
        html: `<p>We've received your return request for ${orderNo} (${reason}). We'll reply with the next steps shortly — fits or refunded.</p>`,
        text: `We've received your return request for ${orderNo} (${reason}). We'll reply shortly. — Evocation`,
      });
    }
    const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    for (const to of admins) {
      await sendEmail({
        to,
        subject: `Return requested — ${orderNo} (${reason})`,
        html: `<p>${escapeHtml(user.email ?? order.email)} requested a return for ${orderNo}.<br>Reason: ${reason}<br>${escapeHtml(details ?? "")}</p><p><a href="${SITE_URL}/admin/returns">Open returns →</a></p>`,
        text: `${user.email ?? order.email} requested a return for ${orderNo} (${reason}).\n${details ?? ""}\n${SITE_URL}/admin/returns`,
      });
    }
  }

  revalidatePath("/account");
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
