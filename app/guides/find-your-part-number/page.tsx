import DocPage, { H2, P, UL } from "@/components/DocPage";
import { getGuide } from "@/lib/guides";
import { SITE_URL, pageMeta } from "@/lib/site";

const guide = getGuide("find-your-part-number")!;

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
        intro="An original manufacturer part number is the single most reliable way to identify an interior or trim piece. Here’s where to find it, and how to use it."
      >
        <H2>Where the number is printed</H2>
        <P>
          Most interior and trim parts carry the original part number moulded,
          stamped, or on a label somewhere out of sight. Common places to look:
        </P>
        <UL
          items={[
            "On the back or underside of the part (moulded into the plastic).",
            "On a small paper or foil label, often near a fixing point.",
            "In the workshop / parts manual for your model, indexed by section.",
            "On the original box if you still have it, or on a previous invoice.",
          ]}
        />
        <P>
          On trim, the number is frequently followed by a colour or trim-code
          suffix (for example a paint or interior code). The base number
          identifies the part; the suffix identifies its finish.
        </P>

        <H2>How manufacturer numbering works</H2>
        <P>
          Each marque has its own scheme, but they share a logic: a group of
          digits identifies the model/platform and the assembly, and the
          remaining digits identify the specific part. A few examples of the
          shape these take:
        </P>
        <UL
          items={[
            "Porsche: grouped numbers such as 928.521.147.02 — model, assembly, part, revision.",
            "Land Rover / Rover era: a letter-plus-digits format such as MXC1306, sometimes with a trim suffix.",
            "German marques often use dotted or spaced groups; British marques often use a letter prefix.",
          ]}
        />
        <P>
          You don’t need to decode it — you just need to read it accurately.
          Note every character, including letters that look like numbers (O/0,
          I/1).
        </P>

        <H2>Using the number to find the part</H2>
        <P>
          Once you have the number, search it directly. On Evocation, the search
          box normalises punctuation and spacing, so
          &ldquo;928 521 147 02&rdquo; and &ldquo;928.521.147.02&rdquo; both find
          the same part. If we’ve revived it, the product page lists the
          original number it replaces.
        </P>
        <UL
          items={[
            <>
              Search your number in the{" "}
              <a href="/shop" className="text-brg hover:underline">
                registry
              </a>
              .
            </>,
            <>
              Not there yet? Add it to the{" "}
              <a href="/#queue" className="text-brg hover:underline">
                resurrection queue
              </a>{" "}
              — that’s how revivals start.
            </>,
            <>
              Unsure you’ve read it right? Send us a photo via the{" "}
              <a href="/contact" className="text-brg hover:underline">
                contact page
              </a>
              .
            </>,
          ]}
        />
      </DocPage>
    </>
  );
}
