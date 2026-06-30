"use client";

import { motion } from "motion/react";

const draw = (delay: number) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: {
    pathLength: { duration: 1.4, delay, ease: "easeInOut" as const },
    opacity: { duration: 0.2, delay },
  },
});

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay },
});

export default function ExplodedDrawing() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <svg
          viewBox="0 0 520 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Exploded view technical drawing — cup handle"
          className="exploded block h-auto w-full"
        >
          {/* frame crosshairs */}
          <motion.line {...draw(0.4)} x1="10" y1="10" x2="34" y2="10" stroke="#1A1714" strokeWidth="1" />
          <motion.line {...draw(0.4)} x1="10" y1="10" x2="10" y2="34" stroke="#1A1714" strokeWidth="1" />
          <motion.line {...draw(0.4)} x1="510" y1="450" x2="486" y2="450" stroke="#1A1714" strokeWidth="1" />
          <motion.line {...draw(0.4)} x1="510" y1="450" x2="510" y2="426" stroke="#1A1714" strokeWidth="1" />

          {/* escutcheon plate */}
          <motion.rect {...draw(0.6)} x="80" y="150" width="200" height="120" rx="14" stroke="#1A1714" strokeWidth="1.4" />
          <motion.rect {...draw(0.9)} x="96" y="166" width="168" height="88" rx="10" stroke="#1A1714" strokeWidth="1" strokeDasharray="3 4" />

          {/* handle body (offset, exploded) */}
          <motion.path
            {...draw(1.1)}
            d="M330 120 q70 10 70 70 q0 60 -70 70 l-18 0 q-14 0 -14 -16 l0 -108 q0 -16 14 -16 z"
            stroke="#1F4D36"
            strokeWidth="1.6"
          />
          <motion.path
            {...draw(1.4)}
            d="M340 142 q44 8 44 48 q0 40 -44 48"
            stroke="#1F4D36"
            strokeWidth="1"
            strokeDasharray="3 4"
          />

          {/* screws */}
          <motion.circle {...draw(1.5)} cx="120" cy="330" r="14" stroke="#1A1714" strokeWidth="1.2" />
          <motion.line {...draw(1.7)} x1="111" y1="330" x2="129" y2="330" stroke="#1A1714" strokeWidth="1.2" />
          <motion.circle {...draw(1.6)} cx="180" cy="350" r="14" stroke="#1A1714" strokeWidth="1.2" />
          <motion.line {...draw(1.8)} x1="171" y1="350" x2="189" y2="350" stroke="#1A1714" strokeWidth="1.2" />

          {/* leader lines + callouts */}
          <motion.line {...draw(1.9)} x1="180" y1="150" x2="140" y2="92" stroke="#1A1714" strokeWidth=".8" />
          <motion.circle {...draw(2.0)} cx="132" cy="82" r="11" stroke="#1A1714" strokeWidth=".8" />
          <motion.text {...fade(2.2)} x="132" y="86" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="11" fill="#1A1714">
            1
          </motion.text>
          <motion.line {...draw(2.0)} x1="368" y1="190" x2="430" y2="150" stroke="#1A1714" strokeWidth=".8" />
          <motion.circle {...draw(2.1)} cx="440" cy="143" r="11" stroke="#1A1714" strokeWidth=".8" />
          <motion.text {...fade(2.3)} x="440" y="147" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="11" fill="#1A1714">
            2
          </motion.text>
          <motion.line {...draw(2.1)} x1="180" y1="364" x2="220" y2="408" stroke="#1A1714" strokeWidth=".8" />
          <motion.circle {...draw(2.2)} cx="228" cy="416" r="11" stroke="#1A1714" strokeWidth=".8" />
          <motion.text {...fade(2.4)} x="228" y="420" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="11" fill="#1A1714">
            3
          </motion.text>

          {/* dimension line */}
          <motion.line {...draw(2.3)} x1="80" y1="296" x2="280" y2="296" stroke="#4A443C" strokeWidth=".7" />
          <motion.line {...draw(2.4)} x1="80" y1="290" x2="80" y2="302" stroke="#4A443C" strokeWidth=".7" />
          <motion.line {...draw(2.4)} x1="280" y1="290" x2="280" y2="302" stroke="#4A443C" strokeWidth=".7" />
          <motion.text {...fade(2.5)} x="180" y="312" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="9" letterSpacing="1" fill="#4A443C">
            128 MM
          </motion.text>

          {/* centerline */}
          <motion.line {...draw(0.8)} x1="60" y1="210" x2="420" y2="210" stroke="#4A443C" strokeWidth=".6" strokeDasharray="14 5 2 5" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.4 }}
        className="label-mono mt-2 flex justify-between gap-4 border-t border-hairline pt-2.5 !text-[0.72rem] !tracking-[0.12em] text-ink-soft"
      >
        <span>Fig. 1 — Cup handle, exploded view</span>
        <span>EVO-001</span>
      </motion.div>
    </div>
  );
}
