import type { Metadata } from "next";
import DocPage, { H2, P } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "About | Evocation",
  description:
    "Evocation brings back discontinued interior & trim parts for classics and youngtimers — 3D-scanned from originals, remade to last.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <DocPage
      kicker="Our story"
      title="We bring back the parts they stopped making."
      intro="Evocation revives the small interior & trim parts that keep a classic feeling whole — the ones the factory stopped making decades ago."
    >
      <P>
        Every classic has them: the cracked vent, the broken pocket pull, the
        crumbling switch surround. Parts too small to have ever been
        reproduced, too specific to find, and long since marked{" "}
        <em className="text-brg not-italic">No Longer Available</em>. A car can
        be mechanically perfect and still feel unfinished because of one piece
        of trim nobody sells anymore.
      </P>
      <P>
        We started Evocation to fix exactly that. We track down good originals,
        3D-scan them, and remake them in automotive-grade polymers with a
        hand-applied, textured finish that reads like the factory part — not
        like something printed. Each one is stamped Evocation and sold honestly
        as a pattern part, with the original reference quoted so you know
        precisely what it replaces.
      </P>

      <H2>What we believe</H2>
      <P>
        Your car deserves to be whole. Heritage isn&rsquo;t only the engine and
        the bodywork — it&rsquo;s the details you touch every time you drive.
        Bringing those back, properly, is worth doing.
      </P>

      <H2>How we work</H2>
      <P>
        We focus on interior &amp; trim only — never structural or safety
        parts. We print to order, so nothing sits in a warehouse, and we back
        every part with a simple promise: fits or refunded. See{" "}
        <a className="text-brg hover:underline" href="/process">
          how a part is made
        </a>
        .
      </P>

      <P>
        {/* Orlando — replace this paragraph with your own words + a photo when ready. */}
        [Add a personal note here: who you are, the car that started it, and why
        you care. A face and a story sell heritage better than anything.]
      </P>
    </DocPage>
  );
}
