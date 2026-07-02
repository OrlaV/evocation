import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/types";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";

export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let email: string | null = null;
  let total: string | null = null;
  let totalPence: number | null = null;
  let invoiceUrl: string | null = null;
  // until Stripe confirms the payment, stay on the cautious "processing" copy —
  // a missing session id or a failed API call must never read as "confirmed"
  // (nor clear the buyer's cart).
  let processing = true;
  const stripe = getStripe();
  if (stripe && session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["invoice"],
      });
      email = s.customer_details?.email ?? null;
      if (s.amount_total != null) {
        total = formatPrice(s.amount_total);
        totalPence = s.amount_total;
      }
      const inv = s.invoice;
      if (inv && typeof inv === "object" && "hosted_invoice_url" in inv) {
        invoiceUrl = (inv.hosted_invoice_url as string | null) ?? null;
      }
      // "no_payment_required" = 100% promotion code — still a confirmed order
      processing = !["paid", "no_payment_required"].includes(s.payment_status);
    } catch {
      // transient Stripe error / stale session id — keep the processing state
    }
  }

  return (
    <main className="wrap flex min-h-[60vh] flex-col items-center justify-center py-[clamp(56px,10vh,120px)] text-center">
      {!processing && (
        <ClearCart valuePence={totalPence} sessionId={session_id ?? null} />
      )}
      <span className="label-mono inline-block border border-brg px-2 py-[3px] !text-[0.66rem] text-brg">
        {processing ? "Payment processing" : "Order confirmed"}
      </span>
      <h1 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-bold tracking-[-0.015em]">
        {processing ? (
          "Almost there."
        ) : (
          <>Thank you{total ? <> — that&apos;s {total}</> : null}.</>
        )}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[1.02rem] text-ink-soft">
        {processing
          ? "Your payment is still being confirmed — we'll email you the moment it clears. "
          : null}
        {!processing && <>Your order is in.{" "}</>}
        {email ? (
          <>
            A confirmation is on its way to <b className="text-ink">{email}</b>.{" "}
          </>
        ) : null}
        Each part is printed to order and finished by hand — we&rsquo;ll email
        dispatch details next. Fits or refunded.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/shop"
          className="label-mono chamfer bg-brg px-[26px] py-4 font-bold text-cream transition-colors hover:bg-brg-deep"
        >
          Back to the registry
        </Link>
        <Link href="/account" className="label-mono text-brg hover:underline">
          View your orders →
        </Link>
        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono text-ink-soft transition-colors hover:text-brg"
          >
            Download invoice ↗
          </a>
        )}
      </div>
    </main>
  );
}
