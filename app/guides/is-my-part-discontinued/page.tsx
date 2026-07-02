import DocPage, { H2, P, UL } from "@/components/DocPage";
import { getGuide } from "@/lib/guides";
import { SITE_URL, pageMeta } from "@/lib/site";

const guide = getGuide("is-my-part-discontinued")!;

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
        intro="NLA — No Longer Available — means the manufacturer has stopped producing a part. Here’s how to confirm it, and what your options are."
      >
        <H2>What &ldquo;NLA&rdquo; actually means</H2>
        <P>
          A part is NLA when the manufacturer has ended production and has no
          remaining factory stock. It’s different from &ldquo;on back-order&rdquo;
          (temporarily out of stock but still made) or &ldquo;special
          order&rdquo; (still available, but only made to order at a price). For
          older interior and trim parts, NLA is common: low demand and ageing
          tooling mean the factory quietly drops them.
        </P>

        <H2>How to check</H2>
        <UL
          items={[
            "Ask a main dealer parts desk to look the number up — they’ll see ’NLA’, ’no longer serviced’, or a nil stock with no reorder.",
            "Check marque specialists and the classic parts network; a genuine NLA part disappears from everyone at once, or only surfaces used.",
            "Search the number online: if the only hits are worn used examples and forum ’anyone found one?’ threads, that’s a strong NLA signal.",
            "Watch for ’superseded by’ — sometimes a part number is replaced by a newer one that still fits. If nothing supersedes it, it’s likely gone.",
          ]}
        />
        <P>
          A useful tell for trim specifically: parts that crack or fade with UV
          and heat (dash vents, switch surrounds, pulls) are both the first to
          fail and the first to go NLA — so demand outlives supply.
        </P>

        <H2>Your options when it’s NLA</H2>
        <UL
          items={[
            "Hunt for a good used original — viable, but you’re often buying someone else’s soon-to-crack part at a premium when one surfaces at all.",
            "Have one remade. Evocation 3D-scans an original and reproduces the part in engineering polymer with an OEM-grain finish, referenced to the original number.",
            "Register your demand — if we haven’t revived yours yet, adding it to the queue is what tells us to.",
          ]}
        />
        <UL
          items={[
            <>
              Search your number in the{" "}
              <a href="/shop" className="text-brg hover:underline">
                registry
              </a>
              , or browse{" "}
              <a href="/vehicles" className="text-brg hover:underline">
                parts by vehicle
              </a>
              .
            </>,
            <>
              Add an NLA part to the{" "}
              <a href="/requests" className="text-brg hover:underline">
                resurrection queue
              </a>
              .
            </>,
          ]}
        />
      </DocPage>
    </>
  );
}
