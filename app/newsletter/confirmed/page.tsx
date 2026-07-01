import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Newsletter — Evocation",
  robots: { index: false },
};

export default async function NewsletterConfirmed({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const confirmed = ok === "1";

  return (
    <main className="wrap flex min-h-[60vh] flex-col items-center justify-center py-[clamp(56px,10vh,120px)] text-center">
      <span className="label-mono inline-block border border-brg px-2 py-[3px] !text-[0.66rem] text-brg">
        {confirmed ? "Subscribed" : "Link problem"}
      </span>
      <h1 className="font-display mt-5 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] font-bold tracking-[-0.015em]">
        {confirmed ? "You're on the list." : "That link didn't work."}
      </h1>
      <p className="mt-4 max-w-[48ch] text-[1.02rem] text-ink-soft">
        {confirmed
          ? "We'll email you when we bring a part back. No spam, and you can unsubscribe any time."
          : "The confirmation link may have expired or already been used. Try subscribing again from the footer."}
      </p>
      <Link
        href="/shop"
        className="label-mono chamfer mt-8 bg-brg px-[26px] py-4 font-bold text-cream transition-colors hover:bg-brg-deep"
      >
        Browse the registry
      </Link>
    </main>
  );
}
