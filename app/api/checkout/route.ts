import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  shippingOptionsForCart,
  shippingPenceForCart,
  ALL_COUNTRIES,
  type PackItem,
} from "@/lib/shipping";
import { getSettings } from "@/lib/settings";
import { getProductBySlug } from "@/lib/products";
import {
  createSupabaseServerClient,
  createServiceClient,
} from "@/lib/supabase-server";
import { ensureStripeCustomer } from "@/lib/stripe-customer";

/* Creates a Stripe Checkout Session for a cart of one or more products.
   Every price is re-read server-side from the DB — never trusted from the
   client. Shipping is a Royal Mail rate from the cart's total "slots" (the box
   tier, and box count if it overflows). VAT-inclusive pricing. */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout isn't available yet." },
      { status: 503 },
    );
  }

  let body: {
    slug?: string;
    optionKey?: string;
    items?: { slug: string; optionKey?: string; qty?: number }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // accept a cart (items[]) or a single product (back-compat)
  const requested =
    body.items && body.items.length
      ? body.items
      : body.slug
        ? [{ slug: body.slug, optionKey: body.optionKey, qty: 1 }]
        : [];
  if (!requested.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const packItems: PackItem[] = [];
  let firstEvo = "";
  let firstRefs = "";
  // items the buyer asked for that we couldn't honour (unpublished / removed /
  // option gone) — surfaced so they're never silently charged for less.
  const dropped: string[] = [];

  try {
    for (const it of requested) {
      if (!it?.slug) continue;
      const product = await getProductBySlug(it.slug);
      if (!product) {
        dropped.push(it.slug);
        continue;
      }
      // an explicit option that no longer exists must NOT fall back to the base
      // price (could be a placeholder) — treat it as a dropped line instead.
      const option = it.optionKey
        ? (product.options ?? []).find((o) => o.key === it.optionKey)
        : undefined;
      if (it.optionKey && !option) {
        dropped.push(product.name);
        continue;
      }
      const amount = option ? option.price_pence : product.price_pence;
      if (!amount || amount <= 0) {
        dropped.push(product.name);
        continue;
      }

      const qty = Math.max(1, Math.min(20, Math.round(it.qty ?? 1)));
    const label = option ? `${product.name} — ${option.label}` : product.name;
    const refs = option
      ? option.items.map((x) => `${x.qty}×${x.ref}`).join(", ")
      : product.oem_refs.join(", ");
    packItems.push({ slots: option?.slots ?? product.slots ?? 5, qty });
    if (!firstEvo) {
      firstEvo = product.evo_no;
      firstRefs = refs;
    }

    lineItems.push({
      quantity: qty,
      price_data: {
        currency: "gbp",
        unit_amount: amount,
        tax_behavior: "inclusive",
        product_data: {
          name: label,
          description: `Evocation ${product.evo_no} · replaces ${refs}`,
          tax_code: "txcd_99999999", // general — tangible goods
          metadata: {
            evo_no: product.evo_no,
            product_id: product.id,
            option: option?.key ?? "",
          },
        },
      },
    });
    }
  } catch (e) {
    console.error("checkout cart read:", (e as Error).message);
    return NextResponse.json(
      { error: "Couldn't verify your cart — please try again." },
      { status: 503 },
    );
  }

  if (!lineItems.length) {
    return NextResponse.json(
      { error: "Nothing in your cart is orderable yet." },
      { status: 400 },
    );
  }
  // some items resolved but others didn't → stop rather than charge for a
  // partial cart the buyer didn't confirm. They can refresh and retry.
  if (dropped.length) {
    return NextResponse.json(
      {
        error: `Some items are no longer available (${dropped.join(", ")}). Please review your cart and try again.`,
      },
      { status: 409 },
    );
  }

  const settings = await getSettings();
  const taxEnabled = process.env.STRIPE_TAX_ENABLED === "true";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    req.headers.get("origin") ??
    "http://localhost:3000";

  // link the order to the buyer's account when they're signed in, and reuse
  // their Stripe Customer so the saved address prefills (and new ones are kept)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerId: string | null = null;
  if (user?.email) {
    try {
      const svc = createServiceClient();
      const { data: prof } = await svc
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      customerId = await ensureStripeCustomer(svc, user.id, user.email, prof ?? {});
    } catch (e) {
      console.error("checkout customer:", (e as Error).message);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: taxEnabled },
      // a Customer prefills saved details; customer_update saves edits back.
      // (customer and customer_email are mutually exclusive.)
      ...(customerId
        ? {
            customer: customerId,
            customer_update: {
              address: "auto" as const,
              name: "auto" as const,
              shipping: "auto" as const,
            },
          }
        : user?.email
          ? { customer_email: user.email }
          : {}),
      // accept any country we ship to (buyer is never blocked); show every
      // region's rate for the packed cart — the buyer picks their region
      shipping_address_collection: { allowed_countries: ALL_COUNTRIES },
      shipping_options: shippingOptionsForCart(settings.shipping, packItems),
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      // optional gift message — a niche NLA part is a natural gift between
      // enthusiasts. Captured by the webhook into the order.
      custom_fields: [
        {
          key: "gift_message",
          label: { type: "custom", custom: "Gift message (optional)" },
          type: "text",
          optional: true,
        },
      ],
      // issue a proper (VAT) invoice for every order — trade/garage buyers ask
      // for it, and it doubles as the customer's receipt.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          footer: "Evocation — pattern parts, printed to order in the UK.",
        },
      },
      metadata: {
        item_lines: String(lineItems.length),
        evo_no: firstEvo,
        // Stripe caps metadata values at 500 chars — a long OEM-ref list must
        // never fail the whole checkout.
        refs: firstRefs.slice(0, 450),
        user_id: user?.id ?? "",
        // expected shipping per zone (pence) — the webhook compares the rate
        // the buyer picked against their actual delivery country.
        ship_uk: String(shippingPenceForCart(settings.shipping, "uk", packItems)),
        ship_eu: String(shippingPenceForCart(settings.shipping, "eu", packItems)),
        ship_world: String(
          shippingPenceForCart(settings.shipping, "world", packItems),
        ),
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout:", (e as Error).message);
    return NextResponse.json(
      { error: "Couldn't start checkout — try again." },
      { status: 500 },
    );
  }
}
