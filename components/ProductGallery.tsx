"use client";

import { useRef, useState } from "react";
import { imageUrl } from "@/lib/storage";
import type { GalleryImage } from "@/lib/types";

/* Product gallery. Renders real Supabase Storage images when present; falls
   back to the hatched placeholder (with cursor spotlight) until photos exist. */
export default function ProductGallery({
  name,
  gallery = [],
}: {
  name: string;
  gallery?: GalleryImage[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);

  const hasImages = gallery.length > 0;
  const hero = hasImages ? gallery[Math.min(active, gallery.length - 1)] : null;

  return (
    <div>
      <div
        ref={ref}
        onMouseMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseLeave={() => setPos(null)}
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-hairline ${hero ? "bg-cream-card" : "hatch"}`}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl(hero.path)}
            alt={hero.alt || `${name} — photo`}
            className="h-full w-full object-cover"
          />
        ) : null}
        {/* cursor spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: pos ? 1 : 0,
            background: pos
              ? `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, color-mix(in srgb, var(--brg) 10%, transparent), transparent 70%)`
              : undefined,
          }}
        />
        <span className="absolute top-2 left-2 h-3.5 w-3.5 border-t border-l border-ink-soft" />
        <span className="absolute top-2 right-2 h-3.5 w-3.5 border-t border-r border-ink-soft" />
        <span className="absolute bottom-2 left-2 h-3.5 w-3.5 border-b border-l border-ink-soft" />
        <span className="absolute right-2 bottom-2 h-3.5 w-3.5 border-b border-r border-ink-soft" />
        {!hero && (
          <span className="label-mono border border-dashed border-ink-soft bg-cream px-3.5 py-2 !text-[0.7rem] text-ink-soft">
            Photo — {name}, macro grain
          </span>
        )}
      </div>

      {hasImages ? (
        gallery.length > 1 && (
          <div className="mt-2.5 grid grid-cols-4 gap-2.5">
            {gallery.slice(0, 8).map((g, i) => (
              <button
                key={g.path + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View photo ${i + 1}`}
                className={`relative aspect-[4/3] overflow-hidden border ${i === active ? "border-brg" : "border-hairline hover:border-ink-soft"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(g.path)}
                  alt={g.alt || `${name} thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="mt-2.5 grid grid-cols-4 gap-2.5">
            {["Front", "Grain detail", "Back", "Fitted"].map((label) => (
              <div
                key={label}
                className="hatch flex aspect-[4/3] items-center justify-center border border-hairline"
              >
                <span className="font-mono text-[0.58rem] tracking-[0.1em] text-ink-soft/80 uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="label-mono mt-3 flex justify-between gap-4 border-t border-hairline pt-2.5 !text-[0.68rem] !tracking-[0.12em] text-ink-soft">
            <span>Fig. — photos pending studio session</span>
            <span>Placeholder</span>
          </div>
        </>
      )}
    </div>
  );
}
