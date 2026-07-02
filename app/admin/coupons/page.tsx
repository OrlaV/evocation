import type { Metadata } from "next";
import type Stripe from "stripe";
import { requireAdmin } from "@/lib/admin-auth";
import { getStripe } from "@/lib/stripe";
import { CouponForm, PromoToggle } from "@/components/admin/CouponManager";

export const metadata: Metadata = {
  title: "Promo codes — Evocation admin",
  robots: { index: false },
};

const discountLabel = (c: Stripe.Coupon | null) => {
  if (!c) return "—";
  if (c.percent_off) return `${c.percent_off}% off`;
  if (c.amount_off) return `£${(c.amount_off / 100).toFixed(2)} off`;
  return "—";
};

/* Promo codes live in Stripe (the checkout's promo field validates them
   natively); this page manages them without leaving the admin. */
export default async function AdminCouponsPage() {
  await requireAdmin();
  const stripe = getStripe();

  let codes: Stripe.PromotionCode[] = [];
  let stripeError: string | null = null;
  if (!stripe) {
    stripeError = "Stripe isn't configured (set STRIPE_SECRET_KEY).";
  } else {
    try {
      const res = await stripe.promotionCodes.list({
        limit: 100,
        expand: ["data.promotion.coupon"],
      });
      codes = res.data;
    } catch (e) {
      stripeError = (e as Error).message;
    }
  }

  return (
    <main className="flex-1 py-12">
      <div className="wrap">
        <a
          href="/admin"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to registry admin
        </a>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label-mono !tracking-[0.18em] text-brg">
              Workshop
            </div>
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">
              Promo codes
            </h1>
          </div>
          <div className="label-mono !text-[0.7rem] text-ink-soft">
            {codes.length} code{codes.length === 1 ? "" : "s"} ·{" "}
            {codes.filter((c) => c.active).length} active
          </div>
        </div>
        <p className="mt-2 max-w-[64ch] font-mono text-[0.74rem] leading-[1.5] text-ink-soft/80">
          Customers enter these in the &ldquo;Add promotion code&rdquo; field on
          the Stripe payment page — validation, expiry and usage limits are
          enforced by Stripe. Codes can&apos;t be deleted, only deactivated.
        </p>

        <CouponForm />

        {stripeError ? (
          <div className="mt-8 border border-dashed border-brg/60 px-6 py-8 text-center text-brg">
            {stripeError}
          </div>
        ) : codes.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
            No promo codes yet — create the first one above.
          </div>
        ) : (
          <table className="mt-8 w-full border-collapse border-t border-hairline">
            <thead>
              <tr>
                {["Code", "Discount", "Used", "Min. order", "Expires", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="label-mono border-b border-hairline py-3 pr-3 text-left !text-[0.66rem] !tracking-[0.12em] text-ink-soft"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {codes.map((pc) => {
                const coupon =
                  pc.promotion?.type === "coupon" &&
                  pc.promotion.coupon &&
                  typeof pc.promotion.coupon !== "string"
                    ? pc.promotion.coupon
                    : null;
                const min = pc.restrictions?.minimum_amount;
                return (
                  <tr key={pc.id} className={pc.active ? "" : "opacity-55"}>
                    <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.85rem] font-bold tracking-[0.06em]">
                      {pc.code}
                    </td>
                    <td className="border-b border-hairline py-3.5 pr-3 text-[0.9rem] text-brg">
                      {discountLabel(coupon)}
                    </td>
                    <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.8rem] text-ink-soft">
                      {pc.times_redeemed}
                      {pc.max_redemptions ? ` / ${pc.max_redemptions}` : ""}
                    </td>
                    <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.8rem] text-ink-soft">
                      {min ? `£${(min / 100).toFixed(2)}` : "—"}
                    </td>
                    <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.78rem] text-ink-soft">
                      {pc.expires_at
                        ? new Date(pc.expires_at * 1000).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="border-b border-hairline py-3.5 pr-3">
                      <span
                        className={`label-mono border px-2 py-[2px] !text-[0.62rem] ${
                          pc.active
                            ? "border-gold text-gold"
                            : "border-ink-soft text-ink-soft line-through"
                        }`}
                      >
                        {pc.active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="border-b border-hairline py-3.5">
                      <PromoToggle id={pc.id} active={pc.active} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
