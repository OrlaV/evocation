import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/products";
import ShopGrid from "@/components/ShopGrid";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";

export const metadata: Metadata = {
  title: "Shop — Evocation",
  description:
    "Discontinued interior & trim parts for youngtimers and classics, revived by Evocation. Printed to order in the UK, shipped worldwide.",
  // canonical stays on the bare /shop so the ?q=/?make= filter permutations
  // don't get indexed as duplicates.
  alternates: { canonical: "/shop" },
};

// keep the registry fresh without a rebuild when products change directly in DB
export const revalidate = 3600;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    make?: string;
    model?: string;
    hand?: string;
    sort?: string;
  }>;
}) {
  const [products, sp] = await Promise.all([
    getPublishedProducts(),
    searchParams,
  ]);

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <div className="wrap relative">
        <SectionNo>The Registry — All parts</SectionNo>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal as="h2" className="font-display max-w-[20ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
            {products.length} parts revived.{" "}
            <em className="text-brg not-italic">More in the queue.</em>
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-[44ch] text-ink-soft">
            Every part is printed to order in the UK, hand-finished with the
            factory grain, and shipped worldwide — fits or refunded.
          </Reveal>
        </div>

        <ShopGrid products={products} initial={sp} />

        <Reveal delay={0.1} className="mt-[clamp(20px,3vw,40px)]">
          <a
            href="/#queue"
            className="group flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink-soft/50 px-5 py-4 transition-colors hover:border-brg"
          >
            <span className="text-[0.95rem] text-ink-soft">
              Your part isn&apos;t here? Most revivals start as a request.
            </span>
            <span className="label-mono flex items-center gap-1.5 text-brg">
              Put it in the queue{" "}
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
