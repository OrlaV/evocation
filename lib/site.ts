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
