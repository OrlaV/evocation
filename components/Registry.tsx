"use client";

import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { formatPrice, optionRefs, refLabels, startingPrice } from "@/lib/types";
import Reveal, { EASE } from "./Reveal";
import SectionNo from "./SectionNo";
import GhostNumeral from "./GhostNumeral";

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls = {
    tl: "top-2 left-2 border-t border-l",
    tr: "top-2 right-2 border-t border-r",
    bl: "bottom-2 left-2 border-b border-l",
    br: "bottom-2 right-2 border-b border-r",
  }[pos];
  return <span className={`ui-deco absolute h-3.5 w-3.5 border-ink-soft ${cls}`} />;
}

export function PartCard({
  part,
  index,
  compact = false,
}: {
  part: Product;
  index: number;
  // homepage teaser cards are smaller & denser; the shop keeps the full size.
  compact?: boolean;
}) {
  const fit = part.fitment[0];
  const fitLabel = fit ? `${fit.model} · ${fit.years}` : "";
  const cardId = part.evo_no.toLowerCase();
  const refs = optionRefs(part);
  const labels = refLabels(part);

  return (
    <motion.a
      href={`/parts/${part.slug}`}
      id={cardId}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: EASE }}
      whileHover={{ y: compact ? -3 : -5 }}
      className="group relative flex flex-col border border-hairline bg-cream-card text-inherit no-underline transition-[border-color,box-shadow] duration-300 hover:border-ink hover:shadow-[0_18px_40px_-18px_rgba(26,23,20,0.25)]"
    >
      <div className="hatch relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-hairline">
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
        <span
          className={`absolute font-mono font-medium text-brass ${
            compact
              ? "top-3 left-3 text-[0.62rem] tracking-[0.1em]"
              : "top-4 left-4 text-[0.72rem] tracking-[0.12em]"
          }`}
        >
          {part.evo_no}
        </span>
        <span
          className={`label-mono whitespace-nowrap border border-dashed border-ink-soft bg-cream text-ink-soft transition-transform duration-500 group-hover:scale-[1.04] ${
            compact ? "px-3 py-1.5 !text-[0.6rem]" : "px-3.5 py-2 !text-[0.7rem]"
          }`}
        >
          Photo — macro, grain finish
        </span>
      </div>

      <div className={compact ? "px-5 pt-5 pb-2" : "px-6 pt-6 pb-1"}>
        <h3
          className={`font-display font-bold ${
            compact
              ? "line-clamp-2 min-h-[2.5rem] text-[1.08rem] leading-[1.15]"
              : "text-[1.32rem] leading-[1.15]"
          }`}
        >
          {part.name}
        </h3>
        <div
          className={`mt-0.5 text-ink-soft ${compact ? "truncate text-[0.78rem]" : "text-[0.95rem]"}`}
        >
          {fitLabel}
        </div>

        {compact ? (
          <div className="mt-2.5">
            <div className="label-mono !text-[0.58rem] !tracking-[0.12em] text-ink-soft">
              Replaces{part.badge ? ` · ${part.badge}` : ""}
            </div>
            <div className="mt-1 font-mono text-[0.92rem] font-semibold text-ink">
              {refs[0]}
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="label-mono !text-[0.62rem] !tracking-[0.14em] text-ink-soft">
              Replaces{part.badge ? ` · ${part.badge}` : ""}
            </div>
            <div className="mt-1.5 flex flex-col gap-1">
              {refs.map((r) => (
                <div key={r} className="flex items-baseline gap-2">
                  <span className="font-mono text-[1rem] font-semibold tracking-[0.01em] text-ink">
                    {r}
                  </span>
                  {labels[r] && (
                    <span className="label-mono !text-[0.6rem] !tracking-[0.1em] text-ink-soft">
                      {labels[r]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between gap-4 border-t border-hairline ${
          compact ? "mt-auto px-5 py-4" : "mt-4 px-6 py-4"
        }`}
      >
        <div className="flex items-baseline gap-2">
          <span
            className={`label-mono !tracking-[0.12em] text-ink-soft ${compact ? "!text-[0.62rem]" : "!text-[0.66rem]"}`}
          >
            From
          </span>
          <span
            className={`font-num leading-none ${compact ? "text-[1.45rem]" : "text-[1.75rem]"}`}
          >
            {formatPrice(startingPrice(part))}
          </span>
        </div>
        <div
          className={`label-mono flex items-center gap-1.5 whitespace-nowrap text-ink ${compact ? "!text-[0.62rem]" : ""}`}
        >
          {compact ? "View" : "View part"}{" "}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function Registry({ products }: { products: Product[] }) {
  return (
    <section
      id="registry"
      className="relative overflow-hidden py-[clamp(76px,11vh,140px)]"
    >
      <div className="wrap relative">
        <GhostNumeral n="01" />
        <SectionNo>§ 01 — The Registry</SectionNo>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal as="h2" className="font-display max-w-[20ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
            Every part we revive enters{" "}
            <em className="text-brg not-italic">the registry.</em>
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-[44ch] text-ink-soft">
            Each revival is documented: original fitment, the year the factory
            gave up on it, and the year we brought it back.
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-[clamp(6px,0.6vw,8px)] min-[861px]:grid-cols-4">
          {products.map((part, i) => (
            <PartCard key={part.evo_no} part={part} index={i} compact />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-[clamp(20px,3vw,40px)]">
          <a
            href="#queue"
            className="group flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink-soft/50 px-5 py-4 transition-colors hover:border-brg"
          >
            <span className="text-[0.95rem] text-ink-soft">
              Your car isn&apos;t in the registry yet? Most revivals start as
              a request.
            </span>
            <span className="label-mono flex items-center gap-1.5 text-brg">
              Put your part in the queue{" "}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
