"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import type { FaqItem, Fitment, PurchaseOption } from "@/lib/types";
import { resolveMake, resolveModel } from "@/lib/vehicles";
import { sendEmail, emailConfigured } from "@/lib/email";
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderRefundedEmail,
} from "@/lib/order-emails";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import type { Settings } from "@/lib/settings";

export type ProductPayload = {
  id?: string;
  evo_no: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  badge?: string | null;
  oem_refs: string[];
  maker: string | null;
  fitted_from: number | null;
  fitted_to: number | null;
  discontinued_year: string | null;
  revived_year: number | null;
  fitment: Fitment[];
  options?: PurchaseOption[];
  material: string;
  slots?: number;
  gallery?: import("@/lib/types").GalleryImage[];
  price_pence: number;
  lead_time_days: number;
  in_stock: boolean;
  used_price_note: string | null;
  story_md: string | null;
  faq: FaqItem[];
};

export async function saveProductAction(payload: ProductPayload) {
  await requireAdmin();

  if (!payload.name.trim() || !payload.slug.trim() || !payload.evo_no.trim()) {
    return { ok: false as const, error: "Name, slug and EVO number are required." };
  }
  if (!Number.isFinite(payload.price_pence) || payload.price_pence <= 0) {
    return { ok: false as const, error: "Price must be a positive number." };
  }
  const badOption = (payload.options ?? []).find(
    (o) =>
      o.label.trim() &&
      (!Number.isFinite(o.price_pence) || o.price_pence <= 0),
  );
  if (badOption) {
    return {
      ok: false as const,
      error: `Purchase option "${badOption.label}" needs a price above £0.`,
    };
  }

  const supabase = createServiceClient();
  // strip server-managed columns that the editor may spread from a loaded
  // Product (the trigger recomputes search_refs/fitment_keys/updated_at; id is
  // the row key; created_at must not be overwritten).
  const {
    id,
    created_at: _c,
    updated_at: _u,
    fitment_keys: _fk,
    search_refs: _sr,
    ...rest
  } = payload as ProductPayload & {
    created_at?: unknown;
    updated_at?: unknown;
    fitment_keys?: unknown;
    search_refs?: unknown;
  };
  // snap make/model to the canonical vehicle list so fitment_keys (and the
  // demand-matching that rides on them) stay uniform across the catalogue.
  const row = {
    ...rest,
    fitment: rest.fitment.map((f) => {
      const make = resolveMake(f.make);
      return { ...f, make, model: resolveModel(make, f.model) };
    }),
  };

  const query = id
    ? supabase.from("products").update(row).eq("id", id).select("id, slug").single()
    : supabase.from("products").insert(row).select("id, slug").single();

  const { data, error } = await query;
  if (error) {
    if (error.code === "23505") {
      const friendly = error.message.includes("slug")
        ? `The slug "${row.slug}" is already used by another part.`
        : error.message.includes("evo_no")
          ? `Part number ${row.evo_no} already exists.`
          : "Another part already uses one of these unique values.";
      return { ok: false as const, error: friendly };
    }
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/parts/${data.slug}`);

  return { ok: true as const, id: data.id as string };
}

/* Save adjustable business settings (shipping rates, slot thresholds…). */
export async function saveSettingsAction(payload: Settings) {
  await requireAdmin();

  const t = payload.shipping?.thresholds;
  if (!t || !(t.small > 0 && t.medium > t.small && t.large > t.medium)) {
    return {
      ok: false as const,
      error: "Slot thresholds must increase: small < medium < large.",
    };
  }
  if (!payload.shipping?.zones?.length) {
    return { ok: false as const, error: "At least one shipping zone is required." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ id: 1, value: payload, updated_at: new Date().toISOString() });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/cart");
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  // grab the slug first so we can drop its cached part page too
  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/shop");
  if (existing?.slug) revalidatePath(`/parts/${existing.slug}`);
  return { ok: true as const };
}

/* Notify everyone in the resurrection queue who asked for a model this part
   now fits (exact make+model). Manual trigger — the admin presses the button.
   Marks notified_at so no one is mailed twice. */
export async function notifyWaitingAction(productId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, evo_no, name, slug, fitment_keys")
    .eq("id", productId)
    .maybeSingle();
  if (pErr || !product) {
    return { ok: false as const, error: "Product not found." };
  }

  const keys = (((product.fitment_keys as string[] | null) ?? []) as string[]).filter(
    Boolean,
  );
  if (keys.length === 0) {
    return {
      ok: false as const,
      error: "No recognised make/model on this part yet — add fitment first.",
    };
  }

  const { data: waiting } = await supabase
    .from("queue_requests")
    .select("id, email, make, model")
    .in("vehicle_key", keys)
    .is("notified_at", null);

  const list = (waiting ?? []) as {
    id: string;
    email: string;
    make: string | null;
    model: string | null;
  }[];
  if (list.length === 0) {
    return { ok: true as const, sent: 0, total: 0 };
  }

  if (!emailConfigured()) {
    return {
      ok: false as const,
      error: `Resend isn't set up yet — ${list.length} ${
        list.length === 1 ? "person is" : "people are"
      } waiting. Add RESEND_API_KEY + RESEND_FROM and verify the domain to send.`,
    };
  }

  const sentIds: string[] = [];
  for (const r of list) {
    const res = await sendEmail({
      to: r.email,
      subject: `${product.name} is back in the registry`,
      html: notifyHtml(product.name, product.slug, r.make, r.model),
    });
    if (res.ok) sentIds.push(r.id);
  }
  if (sentIds.length) {
    await supabase
      .from("queue_requests")
      .update({ notified_at: new Date().toISOString() })
      .in("id", sentIds);
  }
  revalidatePath(`/admin/parts/${productId}`);
  return { ok: true as const, sent: sentIds.length, total: list.length };
}

function notifyHtml(
  name: string,
  slug: string,
  make: string | null,
  model: string | null,
) {
  const site = SITE_URL;
  const vehicle = [make, model].filter(Boolean).join(" ");
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#23272b">
    <p style="font:600 11px/1 monospace;letter-spacing:.18em;color:#d8261d;text-transform:uppercase">Evocation — it's back</p>
    <h1 style="font-size:24px;margin:12px 0">${name}</h1>
    <p style="font-size:15px;line-height:1.5;color:#5b6166">
      You asked us to bring back a part${vehicle ? ` for your <strong>${vehicle}</strong>` : ""}.
      It's now in the registry — printed to order, OEM-grain finish, fits or refunded.
    </p>
    <p style="margin:22px 0">
      <a href="${site}/parts/${slug}"
         style="background:#d8261d;color:#fff;text-decoration:none;font:700 13px Arial;padding:13px 22px;display:inline-block">
        View the part →
      </a>
    </p>
    <p style="font-size:12px;color:#8a8f92">You're receiving this because you joined the resurrection queue at ${site}.</p>
  </div>`;
}

/* ---------- admin team management (/admin/team) ---------- */

// Promote an existing account to admin, by email. The person must have signed
// up first (we look them up in auth.users via the service role).
export async function addAdminAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) redirect("/admin/team?err=invalid");

  const svc = createServiceClient();
  const { data: list, error: listErr } = await svc.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) redirect("/admin/team?err=db");
  const target = list.users.find(
    (u) => (u.email ?? "").toLowerCase() === email,
  );
  if (!target) redirect("/admin/team?err=noaccount");

  const { error } = await svc
    .from("admins")
    .upsert(
      { user_id: target.id, email: target.email },
      { onConflict: "user_id" },
    );
  if (error) redirect("/admin/team?err=db");
  revalidatePath("/admin/team");
  redirect("/admin/team?msg=added");
}

// Revoke admin. Never remove the last one in the table (lock-out guard).
export async function removeAdminAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) redirect("/admin/team?err=invalid");

  const svc = createServiceClient();
  const { count } = await svc
    .from("admins")
    .select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) redirect("/admin/team?err=last");

  const { error } = await svc.from("admins").delete().eq("user_id", userId);
  if (error) redirect("/admin/team?err=db");
  revalidatePath("/admin/team");
  redirect("/admin/team?msg=removed");
}

/* ---------- order fulfilment (/admin/orders) ---------- */

type OrderActionResult = { ok: boolean; msg: string };
const ORDER_STATUSES = ["paid", "printed", "shipped", "refunded"] as const;

type OrderRow = {
  id: string;
  order_no: number | null;
  email: string | null;
  amount_pence: number | null;
  items: { name?: string | null; qty?: number | null }[] | null;
  status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  refunded_at: string | null;
  stripe_session_id: string | null;
};

// Save status + Royal Mail tracking. Fires the shipped email once (status
// 'shipped' + tracking) and the refund email once (status 'refunded').
export async function updateOrderAction(input: {
  id: string;
  status: string;
  tracking_number?: string;
}): Promise<OrderActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(input.status as (typeof ORDER_STATUSES)[number])) {
    return { ok: false, msg: "Invalid status." };
  }
  const svc = createServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select(
      "id, order_no, email, amount_pence, items, status, tracking_number, shipped_at, refunded_at",
    )
    .eq("id", input.id)
    .maybeSingle<OrderRow>();
  if (!order) return { ok: false, msg: "Order not found." };

  const tracking = (input.tracking_number ?? "").trim() || null;
  const patch: Record<string, unknown> = {
    status: input.status,
    tracking_number: tracking,
  };
  const notes: string[] = [];

  if (input.status === "shipped" && tracking && !order.shipped_at) {
    if (order.email && emailConfigured()) {
      const mail = orderShippedEmail({
        order_no: order.order_no,
        items: order.items,
        tracking_number: tracking,
      });
      const r = await sendEmail({ to: order.email, ...mail });
      if (r.ok) {
        patch.shipped_at = new Date().toISOString();
        notes.push("shipped email sent");
      } else notes.push(`email failed: ${r.reason}`);
    } else {
      notes.push(
        emailConfigured() ? "no customer email" : "email off (set RESEND_FROM)",
      );
    }
  } else if (input.status === "shipped" && !tracking) {
    notes.push("add a tracking number to email the customer");
  }

  if (input.status === "refunded" && !order.refunded_at) {
    if (order.email && emailConfigured()) {
      const mail = orderRefundedEmail({
        order_no: order.order_no,
        amount_pence: order.amount_pence,
      });
      const r = await sendEmail({ to: order.email, ...mail });
      if (r.ok) {
        patch.refunded_at = new Date().toISOString();
        notes.push("refund email sent");
      } else notes.push(`email failed: ${r.reason}`);
    }
  }

  const { error } = await svc.from("orders").update(patch).eq("id", input.id);
  if (error) return { ok: false, msg: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  return { ok: true, msg: `Saved${notes.length ? ` — ${notes.join("; ")}` : ""}` };
}

// Real refund through Stripe, then mark the order + email the customer (once).
export async function refundOrderAction(id: string): Promise<OrderActionResult> {
  await requireAdmin();
  const stripe = getStripe();
  if (!stripe) return { ok: false, msg: "Stripe isn't configured." };
  const svc = createServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("id, order_no, email, amount_pence, status, refunded_at, stripe_session_id")
    .eq("id", id)
    .maybeSingle<OrderRow>();
  if (!order) return { ok: false, msg: "Order not found." };
  if (order.status === "refunded" || order.refunded_at) {
    return { ok: false, msg: "Already refunded." };
  }
  if (!order.stripe_session_id) {
    return { ok: false, msg: "No Stripe session on this order." };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    const pi =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!pi) return { ok: false, msg: "No payment intent — can't refund." };
    await stripe.refunds.create({ payment_intent: pi });
  } catch (e) {
    return { ok: false, msg: `Stripe refund failed: ${(e as Error).message}` };
  }

  const patch: Record<string, unknown> = { status: "refunded" };
  let note = "Refunded in Stripe";
  if (order.email && emailConfigured()) {
    const mail = orderRefundedEmail({
      order_no: order.order_no,
      amount_pence: order.amount_pence,
    });
    const r = await sendEmail({ to: order.email, ...mail });
    if (r.ok) {
      patch.refunded_at = new Date().toISOString();
      note += " + email sent";
    }
  } else if (!emailConfigured()) note += " (email off — set RESEND_FROM)";

  await svc.from("orders").update(patch).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  return { ok: true, msg: note };
}

// Re-send the order confirmation email.
export async function resendConfirmationAction(id: string): Promise<OrderActionResult> {
  await requireAdmin();
  if (!emailConfigured()) {
    return { ok: false, msg: "Email is off — set RESEND_FROM to send." };
  }
  const svc = createServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("order_no, email, amount_pence, items")
    .eq("id", id)
    .maybeSingle<OrderRow>();
  if (!order) return { ok: false, msg: "Order not found." };
  if (!order.email) return { ok: false, msg: "No customer email." };
  const mail = orderConfirmationEmail({
    order_no: order.order_no,
    amount_pence: order.amount_pence,
    items: order.items,
  });
  const r = await sendEmail({ to: order.email, ...mail });
  return r.ok
    ? { ok: true, msg: "Confirmation re-sent." }
    : { ok: false, msg: r.reason };
}
