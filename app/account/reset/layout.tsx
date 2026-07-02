import type { Metadata } from "next";

/* Client page → metadata lives in this layout. Noindex: a password-reset
   screen must never appear in search results. */
export const metadata: Metadata = {
  title: "Reset password — Evocation",
  robots: { index: false, follow: false },
};

export default function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
