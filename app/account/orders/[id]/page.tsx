import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/types";
import { orderNoLabel, royalMailTrackingUrl } from "@/lib/order-emails";

export const metadata: Metadata = {
  title: "Order — Evocation",
  robots: { index: false },
};

type OrderRow = {
  id: string;
  order_no: number | null;
  amount_pence: number | null;
  items: { name?: string | null; qty?: number | null }[] | null;
  status: string;
  tracking_number: string | null;
  shipping: unknown;
  stripe_session_id: string | null;
  created_at: string;
};

// tolerate both Stripe shapes: {name, address:{...}} and a flat address blob
function shippingLines(shipping: unknown): { name?: string; lines: string[]; phone?: string } {
  const s = (shipping ?? {}) as Record<string, unknown>;
  const addr = (s.address ?? s) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const lines = [
    str(addr.line1),
    str(addr.line2),
    [str(addr.city), str(addr.postal_code)].filter(Boolean).join(" "),
    str(addr.state),
    str(addr.country),
  ].filter((x): x is string => Boolean(x));
  return { name: str(s.name), lines, phone: str(s.phone) };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();

  // RLS ("customers read own orders") scopes this to the signed-in user
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_no, amount_pence, items, status, tracking_number, shipping, stripe_session_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  const order = data as OrderRow | null;
  if (!order) notFound();

  // live invoice link from Stripe (issued after payment)
  let invoiceUrl: string | null = null;
  const stripe = getStripe();
  if (stripe && order.stripe_session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(order.stripe_session_id, {
        expand: ["invoice"],
      });
      const inv = s.invoice;
      if (inv && typeof inv === "object" && "hosted_invoice_url" in inv) {
        invoiceUrl = (inv.hosted_invoice_url as string | null) ?? null;
      }
    } catch {
      /* stale/absent session — no invoice link */
    }
  }

  const addr = shippingLines(order.shipping);
  const items = order.items ?? [];

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[720px]">
        <a
          href="/account"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to your garage
        </a>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-[1.8rem] font-bold">
            {orderNoLabel(order.order_no)}
          </h1>
          <span className="label-mono border border-brg px-2 py-[3px] !text-[0.66rem] text-brg">
            {order.status}
          </span>
        </div>
        <div className="label-mono mt-1 !text-[0.66rem] text-ink-soft">
          {new Date(order.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        {/* items */}
        <div className="label-mono mt-10 mb-3 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
          Items
        </div>
        <ul className="border-t border-hairline">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 border-b border-hairline py-3 text-[0.95rem]"
            >
              <span>{it.name ?? "Part"}</span>
              <span className="font-mono text-[0.85rem] text-ink-soft">
                ×{it.qty ?? 1}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-hairline pt-3">
          <span className="font-semibold">Total paid</span>
          <span className="font-num text-[1.5rem]">
            {order.amount_pence != null ? formatPrice(order.amount_pence) : "—"}
          </span>
        </div>

        {/* delivery */}
        <div className="mt-10 grid grid-cols-1 gap-8 min-[560px]:grid-cols-2">
          <div>
            <div className="label-mono mb-2 !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
              Ship to
            </div>
            {addr.name && <div className="text-[0.95rem]">{addr.name}</div>}
            {addr.lines.length ? (
              addr.lines.map((l, i) => (
                <div key={i} className="text-[0.9rem] text-ink-soft">
                  {l}
                </div>
              ))
            ) : (
              <div className="text-[0.9rem] text-ink-soft">
                Collected at checkout.
              </div>
            )}
            {addr.phone && (
              <div className="label-mono mt-1 !text-[0.62rem] text-ink-soft">
                {addr.phone}
              </div>
            )}
          </div>
          <div>
            <div className="label-mono mb-2 !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
              Tracking
            </div>
            {order.tracking_number ? (
              <a
                href={royalMailTrackingUrl(order.tracking_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.9rem] text-brg hover:underline"
              >
                {order.tracking_number} ↗
              </a>
            ) : (
              <div className="text-[0.9rem] text-ink-soft">
                {order.status === "shipped"
                  ? "On its way."
                  : "Not shipped yet — printed to order."}
              </div>
            )}
            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label-mono mt-4 block !text-[0.66rem] text-ink-soft hover:text-brg"
              >
                Download VAT invoice ↗
              </a>
            )}
          </div>
        </div>

        <div className="label-mono mt-10 !text-[0.66rem] !tracking-[0.1em] text-ink-soft/80">
          Need a return? Every part is fits or refunded — raise one from your{" "}
          <a href="/account" className="text-brg hover:underline">
            orders list
          </a>
          .
        </div>
      </div>
    </main>
  );
}
