import type { Metadata } from "next";
import { getKnownRefs, getRefStatus } from "@/lib/refs";
import { getProductBySlug } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { normalizeRef } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/queue-stages";
import { SITE_URL, pageMeta } from "@/lib/site";
import { PartCard } from "@/components/Registry";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";

/* One page per OEM reference (chantier G). An owner googling a discontinued
   part number lands on its status: revived (buy it), queued (vote for it) or
   unknown (request it). Known refs are prebuilt + indexed; unknown refs still
   render a useful answer but stay out of the index (infinite URL space). */

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const refs = await getKnownRefs();
  return refs.map((r) => ({ ref: r.ref }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const entry = await getRefStatus(ref);
  if (!entry) {
    return {
      title: `${normalizeRef(ref) || ref} — part number lookup | Evocation`,
      description:
        "Check whether a discontinued OEM part number has been revived, is in the resurrection queue, or can be requested.",
      robots: { index: false },
    };
  }
  const vehicle = entry.vehicle ? ` (${entry.vehicle})` : "";
  return pageMeta({
    title:
      entry.status === "revived"
        ? `${entry.display}${vehicle} — discontinued, now remade | Evocation`
        : `${entry.display}${vehicle} — in the resurrection queue | Evocation`,
    description:
      entry.status === "revived"
        ? `OEM part number ${entry.display}${vehicle} is no longer available from the manufacturer. We 3D-scanned an original and remade it: ${entry.product!.name}, printed to order in the UK with an OEM-grain finish. Fits or refunded.`
        : `${entry.count} owner${entry.count === 1 ? "" : "s"} want${entry.count === 1 ? "s" : ""} ${entry.display}${vehicle} brought back. Add your vote — when enough owners ask, we 3D-scan an original and remake it.`,
    path: `/ref/${entry.ref}`,
  });
}

export default async function RefPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const entry = await getRefStatus(ref);
  const display = entry?.display ?? normalizeRef(ref) ?? ref;

  const product =
    entry?.status === "revived" && entry.product
      ? await getProductBySlug(entry.product.slug)
      : null;
  const settings = entry?.status === "queued" ? await getSettings() : null;

  const breadcrumbLd = entry
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Reference registry",
            item: `${SITE_URL}/ref`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.display,
            item: `${SITE_URL}/ref/${entry.ref}`,
          },
        ],
      }
    : null;

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <div className="wrap relative max-w-[820px]">
        <nav className="label-mono mb-8 flex items-center gap-2.5 !text-[0.68rem] text-ink-soft">
          <a href="/ref" className="transition-colors hover:text-brg">
            Reference registry
          </a>
          <span aria-hidden>/</span>
          <span className="text-brass">{display.toUpperCase()}</span>
        </nav>

        <SectionNo>Original part number</SectionNo>
        <Reveal>
          <h1 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.04] font-bold tracking-[-0.015em]">
            <span className="font-mono tracking-[0.02em]">{display}</span>
          </h1>
          {entry?.vehicle && (
            <div className="label-mono mt-3 !text-[0.72rem] !tracking-[0.14em] text-ink-soft">
              {entry.vehicle}
            </div>
          )}
        </Reveal>

        {/* status verdict */}
        <Reveal delay={0.08} className="mt-8">
          {entry?.status === "revived" ? (
            <div>
              <div className="inline-block border border-brg bg-brg/5 px-3 py-1.5">
                <span className="label-mono !text-[0.68rem] !tracking-[0.14em] text-brg">
                  Discontinued — revived by Evocation
                </span>
              </div>
              <p className="mt-5 max-w-[56ch] text-ink-soft">
                The manufacturer no longer makes {display}. We 3D-scanned an
                original and remade it in automotive-grade polymer with the
                factory grain — referenced {entry.product!.evo_no}, printed to
                order in the UK. Fits or refunded.
              </p>
              {product && (
                <div className="mt-8 max-w-[560px]">
                  <PartCard part={product} index={0} />
                </div>
              )}
            </div>
          ) : entry?.status === "queued" ? (
            <div>
              <div className="inline-block border border-gold bg-gold/5 px-3 py-1.5">
                <span className="label-mono !text-[0.68rem] !tracking-[0.14em] text-gold">
                  {entry.stage === "queued"
                    ? "In the resurrection queue"
                    : STAGE_LABELS[entry.stage!]}
                </span>
              </div>
              <p className="mt-5 max-w-[56ch] text-ink-soft">
                {entry.count} owner{entry.count === 1 ? " has" : "s have"} asked
                us to bring {display} back
                {entry.stage !== "queued"
                  ? " — and it's in the workshop now."
                  : ". When enough owners back a part, we source an original, 3D-scan it and remake it."}
              </p>
              {entry.stage === "queued" && settings && (
                <div className="mt-6 max-w-[420px]">
                  <div className="label-mono mb-2 !text-[0.66rem] text-ink-soft">
                    {entry.count} / {settings.queueVoteTarget} votes
                  </div>
                  <div className="h-[4px] bg-ink-soft/15">
                    <div
                      className="h-full bg-brg"
                      style={{
                        width: `${Math.min(100, Math.round(((entry.count ?? 0) / Math.max(1, settings.queueVoteTarget)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <a
                href="/#queue"
                className="label-mono mt-7 inline-block bg-brg px-6 py-3.5 font-bold text-cream transition-colors hover:bg-brg-deep"
              >
                Add my vote →
              </a>
            </div>
          ) : (
            <div>
              <div className="inline-block border border-ink-soft/50 px-3 py-1.5">
                <span className="label-mono !text-[0.68rem] !tracking-[0.14em] text-ink-soft">
                  Not in the registry yet
                </span>
              </div>
              <p className="mt-5 max-w-[56ch] text-ink-soft">
                We haven&apos;t revived {display} and no one has requested it
                yet. If the manufacturer has dropped it, put it in the
                resurrection queue — requests are how every revival starts, and
                we&apos;ll email you the day it&apos;s back.
              </p>
              <a
                href="/#queue"
                className="label-mono mt-7 inline-block bg-brg px-6 py-3.5 font-bold text-cream transition-colors hover:bg-brg-deep"
              >
                Request this part →
              </a>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15} className="mt-[clamp(32px,5vw,56px)]">
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-5">
            <a
              href="/ref"
              className="label-mono !text-[0.68rem] text-ink-soft transition-colors hover:text-brg"
            >
              Look up another number →
            </a>
            <a
              href="/guides/is-my-part-discontinued"
              className="label-mono !text-[0.68rem] text-ink-soft transition-colors hover:text-brg"
            >
              How to tell if a part is discontinued →
            </a>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
