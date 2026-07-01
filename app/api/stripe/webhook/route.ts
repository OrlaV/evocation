import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase-server";
import { sendEmail, emailConfigured } from "@/lib/email";
import {
  orderConfirmationEmail,
  adminOrderNotificationEmail,
} from "@/lib/order-emails";

// shop-owner recipients for internal order alerts (break-glass admin allowlist)
const adminRecipients = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* Stripe webhook. Verifies the signature, then on a completed checkout writes
   the order to Supabase (service role, bypasses RLS) and emails a confirmation
   (inert until Resend is configured). Node runtime + raw body are required for
   signature verification. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (e) {
    console.error("webhook signature:", (e as Error).message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  console.log("[stripe webhook] received:", event.type);

  // sync card payments fire `completed` already paid; async methods (e.g. bank
  // debits) fire `completed` unpaid, then `async_payment_succeeded` once captured.
  const ORDER_EVENTS = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ];
  if (ORDER_EVENTS.includes(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;

    // only record the order once the money is actually captured
    if (session.payment_status !== "paid") {
      console.log(
        "[stripe webhook] not captured yet, skipping:",
        session.payment_status,
      );
      return NextResponse.json({ received: true });
    }

    try {
      // line items are best-effort — never let them block writing the order.
      // Expand the product so we can persist the ids the fulfilment side needs
      // (which EVO / product / option to print), not just a display string.
      let items: Array<{
        name: string | null;
        qty: number;
        amount_pence: number | null;
        product_id?: string | null;
        evo_no?: string | null;
        option?: string | null;
      }> = [];
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 100, expand: ["data.price.product"] },
        );
        items = lineItems.data.map((li) => {
          const product = li.price?.product;
          const meta =
            product && typeof product === "object" && "metadata" in product
              ? (product.metadata as Record<string, string> | undefined)
              : undefined;
          return {
            name: li.description,
            qty: li.quantity ?? 1,
            amount_pence: li.amount_total,
            product_id: meta?.product_id || null,
            evo_no: meta?.evo_no || null,
            option: meta?.option || null,
          };
        });
      } catch (e) {
        console.error("listLineItems:", (e as Error).message);
        items = [
          {
            name: session.metadata?.evo_no
              ? `Evocation ${session.metadata.evo_no}${session.metadata.refs ? ` · ${session.metadata.refs}` : ""}`
              : "Order",
            qty: 1,
            amount_pence: session.amount_total,
          },
        ];
      }

      // shipping_details moved under collected_information in recent API
      // versions — read defensively across shapes.
      const s = session as unknown as {
        shipping_details?: unknown;
        collected_information?: { shipping_details?: unknown };
        customer_details?: { address?: unknown };
      };
      const baseShipping =
        s.shipping_details ??
        s.collected_information?.shipping_details ??
        s.customer_details?.address ??
        null;
      // fold the phone into the shipping blob (no extra column) so the admin
      // has it for the Royal Mail label.
      const phone = session.customer_details?.phone ?? null;
      // optional gift message from the Checkout custom field
      const giftMessage =
        session.custom_fields?.find((f) => f.key === "gift_message")?.text
          ?.value || null;
      const shipping =
        baseShipping || phone || giftMessage
          ? {
              ...(baseShipping as object | null),
              ...(phone ? { phone } : {}),
              ...(giftMessage ? { gift_message: giftMessage } : {}),
            }
          : null;

      const email =
        session.customer_details?.email ?? session.customer_email ?? null;
      // set on the checkout session metadata when the buyer was signed in
      const userId = session.metadata?.user_id || null;

      const supabase = createServiceClient();
      // insert (not upsert) so a duplicate webhook delivery is detectable via
      // the unique stripe_session_id — that way the confirmation email fires
      // exactly once and a transient DB error can return 500 for Stripe to retry.
      const { data: inserted, error } = await supabase
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          email,
          user_id: userId,
          amount_pence: session.amount_total,
          items,
          shipping,
          status: "paid",
        })
        .select("order_no")
        .single();

      if (error) {
        if (error.code === "23505") {
          console.log("[stripe webhook] already recorded, skipping:", session.id);
          return NextResponse.json({ received: true });
        }
        // transient DB failure → 500 so Stripe retries; never lose a paid order
        console.error("[stripe webhook] order insert FAILED:", error.message);
        return NextResponse.json({ error: "db write failed" }, { status: 500 });
      }
      console.log("[stripe webhook] order saved:", session.id, "→", email ?? "(no email)");

      if (emailConfigured()) {
        if (email) {
          const mail = orderConfirmationEmail({
            order_no: inserted?.order_no,
            amount_pence: session.amount_total,
            items,
          });
          await sendEmail({ to: email, ...mail });
        }
        // internal heads-up so the owner starts the print job promptly
        const admins = adminRecipients();
        if (admins.length) {
          const notif = adminOrderNotificationEmail({
            order_no: inserted?.order_no,
            amount_pence: session.amount_total,
            items,
            email,
          });
          for (const to of admins) await sendEmail({ to, ...notif });
        }
      }
    } catch (e) {
      console.error("webhook handler:", (e as Error).message);
      return NextResponse.json({ error: "handler error" }, { status: 500 });
    }
  }

  // Reconcile refunds issued directly in the Stripe dashboard (the admin action
  // already marks the row; this catches out-of-band refunds so orders never
  // diverge from Stripe). Matched via the charge's payment_intent → session.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const pi =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (pi) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: pi,
          limit: 1,
        });
        const sid = sessions.data[0]?.id;
        if (sid) {
          const supabase = createServiceClient();
          const { data: row } = await supabase
            .from("orders")
            .select("id, status, refunded_at")
            .eq("stripe_session_id", sid)
            .maybeSingle();
          if (row && row.status !== "refunded") {
            await supabase
              .from("orders")
              .update({
                status: "refunded",
                refunded_at: row.refunded_at ?? new Date().toISOString(),
              })
              .eq("id", row.id);
            console.log("[stripe webhook] order reconciled as refunded:", sid);
          }
        }
      } catch (e) {
        console.error("charge.refunded reconcile:", (e as Error).message);
      }
    }
  }

  // Chargeback opened — the status check constraint doesn't allow 'disputed',
  // so just alert the owner (a status column change would need a migration).
  if (event.type === "charge.dispute.created") {
    const admins = adminRecipients();
    if (admins.length && emailConfigured()) {
      const dispute = event.data.object as Stripe.Dispute;
      const amount = ((dispute.amount ?? 0) / 100).toFixed(2);
      for (const to of admins)
        await sendEmail({
          to,
          subject: `⚠ Chargeback opened — £${amount}`,
          html: `<p>A Stripe dispute was opened (£${amount}, reason: ${dispute.reason}). Respond in the Stripe dashboard before the deadline.</p>`,
          text: `A Stripe dispute was opened (£${amount}, reason: ${dispute.reason}). Respond in the Stripe dashboard before the deadline.`,
        });
    }
  }

  return NextResponse.json({ received: true });
}
