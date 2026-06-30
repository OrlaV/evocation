import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase-server";
import { sendEmail, emailConfigured } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/order-emails";

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
      // line items are best-effort — never let them block writing the order
      let items: Array<{ name: string | null; qty: number; amount_pence: number | null }> = [];
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 100 },
        );
        items = lineItems.data.map((li) => ({
          name: li.description,
          qty: li.quantity ?? 1,
          amount_pence: li.amount_total,
        }));
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
      const shipping =
        baseShipping || phone
          ? { ...(baseShipping as object | null), ...(phone ? { phone } : {}) }
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

      if (email && emailConfigured()) {
        const mail = orderConfirmationEmail({
          order_no: inserted?.order_no,
          amount_pence: session.amount_total,
          items,
        });
        await sendEmail({ to: email, ...mail });
      }
    } catch (e) {
      console.error("webhook handler:", (e as Error).message);
      return NextResponse.json({ error: "handler error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
