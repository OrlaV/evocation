import DocPage, { H2, P, UL } from "@/components/DocPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms & Conditions | Evocation",
  description:
    "The terms of sale for Evocation — pattern interior & trim parts, printed to order in the UK.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <DocPage kicker="Legal" title="Terms & Conditions" updated="July 2026">
      <P>
        These terms govern your use of evocation.store and any purchase you make
        from Evocation (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By placing an order
        you accept them. Evocation is operated by Collation Ltd, 48 Acomb
        Crescent, Newcastle upon Tyne NE3 2BA, United Kingdom. Contact:
        contact@evocation.store.
      </P>

      <H2>What we sell</H2>
      <P>
        We make <b>pattern parts</b> — interior &amp; trim components for
        classic and youngtimer vehicles, 3D-scanned from originals and produced
        to order in automotive-grade polymers with a textured OEM-style finish.
        Each part is stamped &ldquo;Evocation&rdquo;.
      </P>
      <P>
        We are <b>not affiliated with, endorsed by, or connected to any vehicle
        manufacturer</b>. Original manufacturer part numbers are quoted for
        reference and identification only, to indicate the part a given item is
        designed to replace. All trade marks belong to their respective owners.
      </P>
      <P>
        We supply <b>interior &amp; trim parts only</b> — never structural,
        load-bearing or safety-critical components. Parts are sold for the
        purpose described on their page.
      </P>

      <H2>Orders &amp; pricing</H2>
      <UL
        items={[
          "Prices are shown in GBP and include UK VAT where applicable. Your order is confirmed once payment is captured and you receive a confirmation email.",
          "Parts are printed to order; the lead time shown on each product is indicative, not guaranteed.",
          "We may decline or cancel an order (with a full refund) — for example if a price was clearly mis-stated or a part can no longer be produced.",
          "Outside the UK, import duties or taxes may apply on delivery and are the buyer's responsibility.",
        ]}
      />

      <H2>The guarantee</H2>
      <P>
        Every part is covered: <b>fits or refunded</b>. If a part doesn&rsquo;t
        fit the vehicle it&rsquo;s listed for, return it for a refund. If it
        fails through a manufacturing fault of ours (not wear, misuse or
        accident), we&rsquo;ll exchange it. See our{" "}
        <a className="text-brg hover:underline" href="/legal/returns">
          Returns &amp; Refunds
        </a>{" "}
        policy for how and when.
      </P>

      <H2>Liability</H2>
      <P>
        Nothing here limits liability for death or personal injury caused by
        negligence, or for fraud. Otherwise, to the extent permitted by law, our
        liability for any order is limited to the amount you paid for it. Parts
        must be fitted competently; we are not liable for incorrect fitting or
        for use outside a part&rsquo;s intended purpose.
      </P>

      <H2>Your statutory rights</H2>
      <P>
        Nothing in these terms affects your statutory rights as a consumer under
        UK law, including the Consumer Rights Act 2015 and the Consumer
        Contracts Regulations 2013.
      </P>

      <H2>Governing law</H2>
      <P>
        These terms are governed by the laws of England and Wales, and disputes
        are subject to the courts of England and Wales.
      </P>
    </DocPage>
  );
}
