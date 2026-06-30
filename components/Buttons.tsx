import type { ReactNode } from "react";

const base =
  "label-mono chamfer group relative inline-flex items-center gap-2 cursor-pointer px-[28px] py-[15px] !text-[0.74rem] font-bold transition-colors duration-200";

export function ButtonPrimary({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`${base} bg-brg text-cream hover:bg-brg-deep`}
    >
      {children}
    </a>
  );
}

export function ButtonGhost({
  href,
  children,
  light = false,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <a
      href={href}
      className={`${base} ${
        light
          ? "bg-transparent text-cream shadow-[inset_0_0_0_1.5px_var(--ink-soft)] hover:bg-cream hover:text-ink"
          : "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_var(--ink)] hover:bg-ink hover:text-cream"
      }`}
    >
      {children}
    </a>
  );
}
