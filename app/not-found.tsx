export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden py-24">
      <span
        aria-hidden
        className="font-display pointer-events-none absolute top-1/2 right-[4vw] -translate-y-1/2 leading-none font-bold select-none"
        style={{
          fontSize: "clamp(10rem,28vw,24rem)",
          color: "transparent",
          WebkitTextStroke:
            "1px color-mix(in srgb, var(--ink) 12%, transparent)",
        }}
      >
        404
      </span>
      <div className="wrap relative">
        <div className="label-mono !tracking-[0.18em] text-brg">
          Ref. not found
        </div>
        <h1 className="font-display mt-4 max-w-[18ch] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.015em]">
          This part isn&apos;t in the registry — <em className="text-brg not-italic">yet.</em>
        </h1>
        <p className="mt-5 max-w-[46ch] text-ink-soft">
          The page you&apos;re after doesn&apos;t exist, or the part hasn&apos;t
          been revived. Most revivals start exactly like this — with someone
          looking for a part that&apos;s gone.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          <a
            href="/shop"
            className="label-mono border border-transparent bg-brg px-[26px] py-[14px] text-cream transition-colors hover:bg-brg-deep"
          >
            Browse the registry
          </a>
          <a
            href="/#queue"
            className="label-mono border border-ink px-[26px] py-[14px] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Put your part in the queue
          </a>
        </div>
      </div>
    </main>
  );
}
