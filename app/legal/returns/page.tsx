import type { Metadata } from "next";
import DocPage, { H2, P, UL } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "Returns & Refunds | Evocation",
  description:
    "Fits or refunded. How to return an Evocation part and how the guarantee works.",
  alternates: { canonical: "/legal/returns" },
};

export default function ReturnsPage() {
  return (
    <DocPage
      kicker="Support"
      title="Returns & Refunds"
      intro="Fits or refunded — and exchanged if it fails through a fault of ours."
      updated="June 2026"
      draft
    >
      <H2>Fits or refunded</H2>
      <P>
        If a part doesn&rsquo;t fit the vehicle it&rsquo;s listed for, send it
        back within <b>[30] days</b> of delivery for a full refund of the item
        price. Tell us your order number and what didn&rsquo;t fit — your
        chassis/VIN helps us improve the part.
      </P>

      <H2>Faulty parts</H2>
      <P>
        If a part arrives damaged or fails through a manufacturing fault of ours
        — not wear, UV ageing from normal use, accident or incorrect fitting —
        we&rsquo;ll exchange it. Send a photo and your order date to
        contact@evocation.store.
      </P>

      <H2>Change of mind</H2>
      <P>
        Under the Consumer Contracts Regulations you may cancel within{" "}
        <b>14 days</b> of delivery for a refund. Note that parts are{" "}
        <b>printed to order</b> (made to your specification); where that applies
        the statutory cancellation right may be limited — but our own
        fits-or-refunded promise still stands.
      </P>

      <H2>How to return</H2>
      <UL
        items={[
          "Email contact@evocation.store with your order number — we'll confirm the return address.",
          "Pack the part safely; include a note with your order number.",
          "Refunds are issued to your original payment method once we receive the part, typically within [5] working days.",
          "Return postage for a non-fit return is [your policy — e.g. covered by us / paid by you]; faulty returns are always on us.",
        ]}
      />

      <H2>Questions</H2>
      <P>
        Not sure whether a part will fit? Ask us first — email your model and
        chassis number to contact@evocation.store and we&rsquo;ll check before you
        buy.
      </P>
    </DocPage>
  );
}
