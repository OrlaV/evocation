"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "registry", n: "01" },
  { id: "proof", n: "02" },
  { id: "process", n: "03" },
  { id: "queue", n: "04" },
];

export default function SectionRail() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // the rail sits over dark bands while §03/§04 are active
  const dark = active === "process" || active === "queue";

  return (
    <nav
      aria-label="Page sections"
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 min-[1200px]:flex"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center gap-2"
          >
            <span
              className={`font-mono text-[0.66rem] tracking-[0.14em] transition-colors duration-300 ${
                isActive
                  ? dark
                    ? "text-cream"
                    : "text-brg"
                  : dark
                    ? "text-cream/55 group-hover:text-cream/70"
                    : "text-ink-soft/65 group-hover:text-ink-soft"
              }`}
            >
              §{s.n}
            </span>
            <span
              className={`h-px transition-all duration-300 ${
                isActive
                  ? dark
                    ? "w-6 bg-cream"
                    : "w-6 bg-brg"
                  : dark
                    ? "w-3 bg-cream/30"
                    : "w-3 bg-ink-soft/40"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
