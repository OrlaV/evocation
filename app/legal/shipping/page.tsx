import type { Metadata } from "next";
import DocPage, { H2, P, UL } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "Shipping | Evocation",
  description:
    "Printed to order in the UK, shipped worldwide by Royal Mail. Delivery times and costs.",
  alternates: { canonical: "/legal/shipping" },
};

export default function ShippingPage() {
  return (
    <DocPage
      kicker="Support"
      title="Shipping"
      intro="Printed to order in the UK · shipped worldwide by Royal Mail."
      updated="June 2026"
      draft
    >
      <H2>Made to order</H2>
      <P>
        We don&rsquo;t hold stock that doesn&rsquo;t exist — each part is printed
        and hand-finished for your order. The lead time shown on a product is the
        time to make it before dispatch.
      </P>

      <H2>Dispatch &amp; tracking</H2>
      <P>
        Orders ship by Royal Mail. Once your parcel is on its way you&rsquo;ll
        get an email with a tracking number; you can also see it under{" "}
        <a className="text-brg hover:underline" href="/account">
          your account
        </a>
        .
      </P>

      <H2>Cost &amp; regions</H2>
      <P>
        Shipping is calculated at checkout from the size of your order. You
        choose your region on the product or cart page to preview the cost
        before paying.
      </P>
      <UL
        items={[
          "United Kingdom — Royal Mail Tracked (small £3.65 / medium £5.55 / large £11.95).",
          "Europe — [rates to confirm].",
          "Rest of world — [rates to confirm].",
        ]}
      />

      <H2>Customs &amp; duties</H2>
      <P>
        UK prices include VAT. For deliveries outside the UK, any import duties
        or taxes are set by the destination country and are the
        recipient&rsquo;s responsibility.
      </P>
    </DocPage>
  );
}
