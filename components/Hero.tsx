"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ButtonPrimary } from "./Buttons";
import { EASE } from "./Reveal";
import { normalizeRef } from "@/lib/types";

function RefSearch({ refs }: { refs: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = normalizeRef(query);
    if (n.length < 3) return;
    const hit = refs.some((ref) => {
      const r = normalizeRef(ref);
      return r === n || (n.length >= 5 && (r.includes(n) || n.includes(r)));
    });
    if (hit) {
      // a known part number → send the visitor to the shop's real search,
      // carrying the query so it lands pre-filtered. The homepage registry is
      // only a teaser.
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    } else {
      // unknown ref → capture it as a queue request (the demand signal).
      window.dispatchEvent(
        new CustomEvent("evocation:prefill-queue", { detail: query }),
      );
      document.getElementById("queue")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-[440px] border border-cream/25 bg-[color-mix(in_srgb,#0f1115_55%,transparent)] backdrop-blur-sm transition-colors focus-within:border-cream/60"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Part no. — e.g. 928.521.147.02"
        aria-label="Search by original part number"
        className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-mono text-[0.82rem] font-medium tracking-[0.06em] text-cream outline-none placeholder:text-cream/45"
      />
      <button
        type="submit"
        className="label-mono cursor-pointer border-none bg-brg px-5 font-bold text-cream transition-colors hover:bg-brg-deep"
      >
        Find
      </button>
    </form>
  );
}

function MaskedLine({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export type HeroStats = {
  revived: number;
  inQueue: number;
  leadDays: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function Hero({
  searchRefs,
  stats,
}: {
  searchRefs: string[];
  stats: HeroStats;
}) {
  const STATS = [
    { v: pad(stats.revived), label: "Parts revived" },
    { v: pad(stats.inQueue), label: "In the queue" },
    { v: pad(stats.leadDays), label: "Days to ship" },
  ];

  return (
    <section className="hero-dark relative overflow-hidden border-b border-hairline text-cream">
      {/* ===== BACKGROUND PHOTO =====
          Replace this whole block with:
          <img src="/hero.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          The dark scrim below keeps the copy legible over any photo. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink">
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(125deg, transparent 0 13px, rgba(255,255,255,0.025) 13px 14px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 78% 8%, rgba(120,128,135,0.28), transparent 55%)",
          }}
        />
      </div>
      {/* legibility scrim */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,17,21,0.72) 0%, rgba(15,17,21,0.40) 45%, rgba(15,17,21,0.78) 100%)",
        }}
      />

      <div className="wrap relative flex min-h-[clamp(560px,82vh,760px)] flex-col justify-end pt-[clamp(80px,14vh,150px)] pb-[clamp(36px,6vh,64px)]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="label-mono !tracking-[0.2em]"
        >
          NLA — No Longer Available. Until now.
        </motion.div>

        <h1 className="font-display mt-4 mb-6 max-w-[18ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] font-extrabold tracking-[-0.02em]">
          <MaskedLine delay={0.2}>We bring back the</MaskedLine>
          <MaskedLine delay={0.32}>parts they</MaskedLine>
          <MaskedLine delay={0.44}>
            <em className="text-brg not-italic">stopped making.</em>
          </MaskedLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          className="mb-7 max-w-[52ch] text-[1.02rem] font-medium text-cream/80"
        >
          Discontinued interior &amp; trim parts for youngtimers and classics,
          3D-scanned from the originals and remade with a true OEM-grain finish.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.72, ease: EASE }}
          className="flex flex-wrap items-center gap-3"
        >
          <ButtonPrimary href="#registry">Browse the registry</ButtonPrimary>
          <RefSearch refs={searchRefs} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
          className="mt-9 flex flex-wrap gap-x-12 gap-y-3 border-t border-cream/15 pt-5"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-3">
              <span className="font-num text-[clamp(2.2rem,4vw,3rem)] leading-none text-cream">
                {stat.v}
              </span>
              <span className="label-mono !text-[0.66rem]">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
