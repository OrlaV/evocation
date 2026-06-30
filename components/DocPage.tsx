import type { ReactNode } from "react";

/* Shared layout + typographic atoms for static content pages (legal, about,
   contact, process). Keeps them consistent without a typography plugin. */

export default function DocPage({
  kicker,
  title,
  intro,
  updated,
  draft,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  updated?: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 py-[clamp(48px,8vh,90px)]">
      <div className="wrap max-w-[760px]">
        <div className="label-mono !tracking-[0.18em] text-brg">{kicker}</div>
        <h1 className="font-display mt-2 text-[clamp(2rem,4.5vw,3rem)] leading-[1.04] font-bold tracking-[-0.02em]">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-[58ch] text-[1.02rem] text-ink-soft">
            {intro}
          </p>
        )}
        {updated && (
          <div className="label-mono mt-4 !text-[0.66rem] text-ink-soft/80">
            Last updated {updated}
          </div>
        )}
        {draft && (
          <div className="label-mono mt-6 border border-gold px-4 py-3 !text-[0.66rem] !tracking-[0.06em] text-gold">
            Draft — have a solicitor / accountant review before launch. Fill the
            bracketed details.
          </div>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display mt-9 mb-2.5 text-[1.25rem] font-bold tracking-[-0.01em]">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 max-w-[64ch] text-[0.98rem] leading-[1.7] text-ink-soft">
      {children}
    </p>
  );
}

export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-3 max-w-[64ch] list-disc space-y-1.5 pl-5 text-[0.98rem] leading-[1.6] text-ink-soft">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
