/* Evergreen buyer guides — SEO top-of-funnel + fewer wrong-part returns.
   The list feeds the /guides hub and the sitemap; each guide's body lives in
   its own page file. */
export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  blurb: string; // short hub-card summary
};

export const GUIDES: GuideMeta[] = [
  {
    slug: "find-your-part-number",
    title: "How to find your car's original part number",
    description:
      "Where to find the OEM part number for an interior or trim piece, how manufacturer numbering works, and how to use it to find the exact replacement.",
    blurb:
      "The fastest, most reliable way to identify the exact part you need — before you buy.",
  },
  {
    slug: "is-my-part-discontinued",
    title: "Is your part NLA (No Longer Available)?",
    description:
      "What NLA means, how to check whether a dealer can still supply your part, and what your options are when the factory has stopped making it.",
    blurb:
      "How to confirm the factory has stopped making it — and what to do next.",
  },
  {
    slug: "confirm-fitment",
    title: "How to confirm a part will fit before you order",
    description:
      "Left- vs right-hand drive, model phases and body styles, and simple checks (part numbers, measurements, photos) to make sure a trim part fits your car.",
    blurb:
      "LHD/RHD, model phases, measurements — the checks that avoid a return.",
  },
];

export const getGuide = (slug: string) =>
  GUIDES.find((g) => g.slug === slug) ?? null;
