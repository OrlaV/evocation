import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";

export const metadata: Metadata = {
  title: "Guides — identify & fit your classic car parts | Evocation",
  description:
    "Practical guides for owners of classics and youngtimers: find your original part number, check whether a part is discontinued, and confirm fitment before you order.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <div className="wrap relative max-w-[820px]">
        <SectionNo>Guides</SectionNo>
        <div className="mb-10">
          <Reveal>
            <h1 className="font-display max-w-[22ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              Find the <em className="text-brg not-italic">right part.</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-4 max-w-[52ch] text-ink-soft">
            Short, practical guides to identify your part, check whether
            it&apos;s still made, and make sure it fits before you buy.
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(8px,1vw,14px)] min-[641px]:grid-cols-2">
          {GUIDES.map((g) => (
            <a
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group flex flex-col border border-hairline bg-cream-card p-5 no-underline transition-colors hover:border-ink"
            >
              <span className="font-display text-[1.08rem] font-bold text-ink">
                {g.title}
              </span>
              <span className="mt-2 text-[0.9rem] text-ink-soft">{g.blurb}</span>
              <span className="label-mono mt-4 flex items-center gap-1.5 text-brg">
                Read
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
