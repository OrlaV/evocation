"use client";

import { motion } from "motion/react";
import Reveal, { EASE } from "./Reveal";
import GhostNumeral from "./GhostNumeral";

export default function Guarantee() {
  return (
    <section className="relative overflow-hidden border-t border-hairline py-[clamp(76px,11vh,140px)]">
      <div className="wrap relative">
        <GhostNumeral n="05" />
        {/* warranty-certificate treatment: double rule, terms line */}
        <Reveal className="mx-auto max-w-[820px] border border-hairline bg-cream-card p-[6px]">
          <div className="border border-hairline px-[clamp(20px,4vw,56px)] py-[clamp(40px,6vh,72px)] text-center">
            <span className="label-mono block !tracking-[0.18em] text-brg">
              The Evocation Guarantee
            </span>
            <h2 className="font-display mx-auto mt-7 max-w-[22ch] text-[clamp(1.8rem,3.8vw,2.9rem)] leading-[1.12] font-bold tracking-[-0.015em]">
              Doesn&apos;t fit?{" "}
              <em className="relative inline-block text-brg not-italic">
                We take it back.
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, delay: 0.5, ease: EASE }}
                  className="absolute -bottom-2 left-0 h-px w-full origin-left bg-brg"
                />
              </em>
            </h2>
            <p className="mx-auto mt-6 max-w-[54ch] text-ink-soft">
              Every part is checked against the original geometry before it
              ships. If it doesn&apos;t fit your car, return it for a refund.
              And if a part ever fails because of how it was made — not how it
              was used — we exchange it. That&apos;s on us, and we put it
              right.
            </p>
            <div className="label-mono mt-9 flex flex-wrap justify-center gap-x-6 gap-y-1.5 border-t border-hairline pt-5 !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
              <span>Fits or refunded</span>
              <span>Exchanged if the fault is ours</span>
              <span>Checked before dispatch</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
