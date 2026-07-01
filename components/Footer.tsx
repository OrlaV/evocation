import LogoWordmark from "./LogoWordmark";
import NewsletterSignup from "./NewsletterSignup";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "The Registry", href: "/shop" },
      { label: "Parts by vehicle", href: "/vehicles" },
      { label: "Most-wanted parts", href: "/requests" },
      { label: "Request a part", href: "/#queue" },
      { label: "Your account", href: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "The Process", href: "/process" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Shipping", href: "/legal/shipping" },
      { label: "Returns & refunds", href: "/legal/returns" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-cream-deep pt-14 pb-7">
      <div className="wrap">
        <div className="mb-12 grid grid-cols-2 gap-8 min-[861px]:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 min-[861px]:col-span-1">
            <a
              href="/"
              aria-label="Evocation — home"
              className="inline-block text-ink transition-colors hover:text-brg"
            >
              <LogoWordmark className="h-[13px] w-auto" />
            </a>
            <p className="mt-3.5 max-w-[34ch] text-[0.88rem] text-ink-soft">
              Discontinued parts for classics &amp; youngtimers, remade to
              last. Pattern parts, stamped Evocation. Interior &amp; trim only
              — we don&apos;t make structural or safety parts. Printed in the
              UK, shipped worldwide.
            </p>
            <div className="mt-6 max-w-[34ch]">
              <NewsletterSignup />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="label-mono mb-4 !text-[0.7rem] !tracking-[0.16em] text-ink-soft">
                {col.title}
              </h4>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-1 text-[0.9rem] text-ink no-underline transition-colors hover:text-brg"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        {/* oversized logo watermark */}
        <div aria-hidden className="pointer-events-none mb-8 select-none">
          <LogoWordmark className="h-auto w-full text-ink opacity-[0.14]" />
        </div>

        <div className="label-mono flex flex-wrap justify-between gap-4 border-t border-hairline pt-5 !text-[0.66rem] !tracking-[0.1em] text-ink-soft">
          <span>
            © 2026 Evocation · Pattern parts — not affiliated with any vehicle
            manufacturer. Original part numbers are used for reference only.
          </span>
          <span className="flex gap-3">
            <a href="/legal/terms" className="transition-colors hover:text-brg">
              Terms
            </a>
            <a href="/legal/privacy" className="transition-colors hover:text-brg">
              Privacy
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
