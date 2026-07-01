"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useSpring,
} from "motion/react";
import LogoWordmark from "./LogoWordmark";
import { useCart } from "./CartProvider";

const NAV = [
  { label: "The Registry", href: "/shop" },
  { label: "The Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Request a Part", href: "/#queue" },
];


export default function Header() {
  const pathname = usePathname();
  const { count, mounted } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // route-based items only — anchors can't be tracked reliably
  const isActive = (href: string) =>
    href === "/shop" && (pathname === "/shop" || pathname.startsWith("/parts"));
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    mass: 0.4,
  });

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  // close the mobile menu on Escape (and when navigating to a new route)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-hairline bg-[color-mix(in_srgb,var(--cream)_88%,transparent)]"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <a href="/" aria-label="Evocation — home" className="text-ink transition-colors hover:text-brg">
          <LogoWordmark className="h-[13px] w-auto" />
        </a>

        <nav className="hidden items-center gap-[34px] min-[861px]:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`label-mono group relative py-1 transition-colors hover:text-brg ${
                  active ? "text-brg" : "text-ink-soft"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-px bg-brg transition-[width] duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/account"
            className="label-mono px-1 py-2 text-ink-soft transition-colors hover:text-brg"
          >
            Account
          </a>
          <a
            href="/cart"
            aria-label={`Cart${mounted && count ? ` — ${count} item${count > 1 ? "s" : ""}` : ""}`}
            className="label-mono relative px-1 py-2 text-ink-soft transition-colors hover:text-brg"
          >
            Cart
            <AnimatePresence>
              {mounted && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 24 }}
                  className="ml-1 inline-flex min-w-[1.1rem] justify-center rounded-full bg-brg px-1 text-[0.66rem] leading-[1.1rem] font-bold text-cream"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
          <button
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px] min-[861px]:hidden"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
              className="block h-px w-5 bg-ink"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
              className="block h-px w-5 bg-ink"
            />
          </button>
        </div>
      </div>

      {/* scroll progress hairline */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-brg"
      />

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden border-t border-hairline bg-cream min-[861px]:hidden"
          >
            <div className="wrap flex flex-col py-4">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="label-mono border-b border-hairline py-4 text-ink-soft last:border-b-0"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
