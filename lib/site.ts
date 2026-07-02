/* Single source of truth for the public site URL. Used by metadataBase,
   sitemap, robots, transactional emails and checkout return URLs so they never
   disagree. Set NEXT_PUBLIC_SITE_URL at deploy; the default is the live
   production domain (www is canonical — the apex 308-redirects to it). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.evocation.store"
).replace(/\/+$/, "");

/* Public contact address — single source of truth (matches the Resend sending
   domain, evocation.store). Used in legal/contact copy and structured data. */
export const CONTACT_EMAIL = "contact@evocation.store";

/* Site-wide default title/description (root layout + homepage metadata). */
export const SITE_TITLE =
  "Evocation — We bring back the parts they stopped making";
export const SITE_DESCRIPTION =
  "Discontinued interior & trim parts for youngtimers and classics, 3D-scanned from originals and remade in automotive-grade engineering polymers with a true OEM-grain finish. Stamped Evocation. Referenced to the original.";

/* Per-page metadata with matching canonical + Open Graph + Twitter. Next merges
   metadata SHALLOWLY: a page that sets only `title`/`description` inherits the
   root layout's whole `openGraph` object — homepage og:title and og:url on
   every product page shared to a forum. Every indexable page should build its
   metadata through this helper so og:url always agrees with the canonical. */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      siteName: "Evocation",
      url: path, // resolved against metadataBase
      title,
      description,
    },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
