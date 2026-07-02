import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehiclePage, getVehiclePages } from "@/lib/vehicle-pages";
import { optionRefs } from "@/lib/types";
import { SITE_URL, pageMeta } from "@/lib/site";
import { PartCard } from "@/components/Registry";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";

// rebuild periodically so a newly published part appears on its vehicle page
export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await getVehiclePages();
  return pages.map((v) => ({ vehicle: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vehicle: string }>;
}): Promise<Metadata> {
  const { vehicle } = await params;
  const vp = await getVehiclePage(vehicle);
  if (!vp) return {};
  const name = `${vp.make} ${vp.model}`;
  const n = vp.products.length;
  return pageMeta({
    title: `${name} interior & trim parts — revived | Evocation`,
    description: `Discontinued (NLA) and hard-to-find interior & trim parts for the ${name}, 3D-scanned from originals and remade with an OEM-grain finish. ${n} part${n > 1 ? "s" : ""} available — printed to order in the UK, shipped worldwide. Fits or refunded.`,
    path: `/vehicles/${vp.slug}`,
  });
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ vehicle: string }>;
}) {
  const { vehicle } = await params;
  const vp = await getVehiclePage(vehicle);
  if (!vp) notFound();

  const name = `${vp.make} ${vp.model}`;
  // every OEM reference this vehicle's parts replace — a strong long-tail SEO
  // signal ("<ref> replacement") and a recognition trigger for owners.
  const refs = Array.from(new Set(vp.products.flatMap((p) => optionRefs(p))));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Vehicles", item: `${SITE_URL}/vehicles` },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: `${SITE_URL}/vehicles/${vp.slug}`,
      },
    ],
  };
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} interior & trim parts`,
    url: `${SITE_URL}/vehicles/${vp.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: vp.products.length,
      itemListElement: vp.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/parts/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbLd, collectionLd]),
        }}
      />
      <div className="wrap relative">
        {/* breadcrumb */}
        <nav className="label-mono mb-8 flex items-center gap-2.5 !text-[0.68rem] text-ink-soft">
          <a href="/vehicles" className="transition-colors hover:text-brg">
            Vehicles
          </a>
          <span aria-hidden>/</span>
          <span className="text-brass">{name.toUpperCase()}</span>
        </nav>

        <SectionNo>{`Parts for your ${vp.make}`}</SectionNo>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h1 className="font-display max-w-[24ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              {name} parts,{" "}
              <em className="text-brg not-italic">back in production.</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-[46ch] text-ink-soft">
            The discontinued and hard-to-find interior &amp; trim pieces for the{" "}
            {name}, 3D-scanned from originals and remade with the factory grain.
            Printed to order in the UK, shipped worldwide — fits or refunded.
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(20px,3vw,40px)] min-[861px]:grid-cols-2">
          {vp.products.map((part, i) => (
            <PartCard key={part.evo_no} part={part} index={i} />
          ))}
        </div>

        {refs.length > 0 && (
          <Reveal className="mt-[clamp(28px,4vw,52px)]">
            <div className="label-mono mb-3 !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
              Replaces original part numbers
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[0.82rem] text-ink-soft">
              {refs.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.1} className="mt-[clamp(24px,3vw,44px)]">
          <a
            href="/#queue"
            className="group flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink-soft/50 px-5 py-4 transition-colors hover:border-brg"
          >
            <span className="text-[0.95rem] text-ink-soft">
              Need another {vp.make} part we haven&apos;t revived yet?
            </span>
            <span className="label-mono flex items-center gap-1.5 text-brg">
              Request it{" "}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </main>
  );
}
