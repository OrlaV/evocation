"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

const GLYPHS = "0123456789";

/* departure-board effect: digits cycle then settle left to right */
export default function FlapValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [text, setText] = useState(() => value.replace(/./g, "0"));

  useEffect(() => {
    if (!inView) return;
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      let done = true;
      const next = value
        .split("")
        .map((c, i) => {
          const settle = 8 + i * 5;
          if (tick >= settle) return c;
          done = false;
          return GLYPHS[(tick + i * 3) % GLYPHS.length];
        })
        .join("");
      setText(next);
      if (done) clearInterval(id);
    }, 75);
    return () => clearInterval(id);
  }, [inView, value]);

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {text}
    </span>
  );
}
