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
  let processing = false;
  const stripe = getStripe();
  if (stripe && session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      email = s.customer_details?.email ?? null;
      if (s.amount_total != null) total = formatPrice(s.amount_total);
      // a valid session id that isn't paid (async method / abandoned) must not
      // read as "confirmed"
      processing = s.payment_status !== "paid";
    } catch {
      // stale/invalid session id — show the generic confirmation
    }
  }

  return (
    <main className="wrap flex min-h-[60vh] flex-col items-center justify-center py-[clamp(56px,10vh,120px)] text-center">
      {!processing && <ClearCart />}
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
        Each part is printed to order and finished by hand — we'll email dispatch
        details next. Fits or refunded.
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
      </div>
    </main>
  );
}
