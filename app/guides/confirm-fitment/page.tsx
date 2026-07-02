import DocPage, { H2, P, UL } from "@/components/DocPage";
import { getGuide } from "@/lib/guides";
import { SITE_URL, pageMeta } from "@/lib/site";

const guide = getGuide("confirm-fitment")!;

export const metadata = pageMeta({
  title: `${guide.title} | Evocation`,
  description: guide.description,
  path: `/guides/${guide.slug}`,
});

export default function Guide() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      author: { "@type": "Organization", name: "Evocation" },
      publisher: { "@type": "Organization", name: "Evocation" },
      mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.title,
          item: `${SITE_URL}/guides/${guide.slug}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <DocPage
        kicker="Guide"
        title={guide.title}
        intro="A few minutes of checking avoids the hassle of a return. Here’s how to be sure a trim part fits your specific car before you order — and remember, every Evocation part is fits-or-refunded anyway."
      >
        <H2>1. Match the part number first</H2>
        <P>
          The original part number is the most reliable check. If your car’s
          number matches the one on the product page, you’re almost certainly
          right. If it differs, it may be a different variant — read on.
        </P>

        <H2>2. Left- or right-hand drive</H2>
        <P>
          Many interior parts are symmetric and fit either way. But some are
          hand-specific: handbrake and gear surrounds, glovebox and switch
          panels, and anything that mirrors around the driver. Check whether the
          product lists a hand of drive (LHD / RHD) and match it to your car.
        </P>

        <H2>3. Model phase and body style</H2>
        <P>
          The same model over a long production run can change interior details
          between phases (pre- and post-facelift) or between body styles (coupé,
          cabriolet, saloon, estate). On each product the fitment table lists the
          exact models, years and any variant it’s confirmed for.
        </P>
        <UL
          items={[
            "Check your build year falls within the listed range.",
            "Check the body style and any phase/sub-spec note matches yours.",
            "If your car sits on the boundary of a facelift, the part number is the tie-breaker.",
          ]}
        />

        <H2>4. When in doubt, measure or send a photo</H2>
        <UL
          items={[
            "Compare key dimensions and fixing points against your original.",
            "Photograph your existing part (front and back) and its fixings.",
            <>
              Send it via the{" "}
              <a href="/contact" className="text-brg hover:underline">
                contact page
              </a>{" "}
              with your chassis number and we’ll confirm before you order.
            </>,
          ]}
        />

        <H2>The safety net</H2>
        <P>
          Every part in the registry is <strong>fits or refunded</strong>: if it
          doesn’t fit, send it back. And if a part fails through a fault of ours,
          we exchange it. So the worst case of an honest mistake is a return, not
          a loss.
        </P>
      </DocPage>
    </>
  );
}
