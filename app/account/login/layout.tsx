import type { Metadata } from "next";

/* The login page is a client component, so its metadata lives here. robots.txt
   already disallows /account, but a blocked-yet-linked URL can still be
   indexed without content — noindex closes that, and the title stops the page
   from inheriting the homepage one. */
export const metadata: Metadata = {
  title: "Sign in — Evocation",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
