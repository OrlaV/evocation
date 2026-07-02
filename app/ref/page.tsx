import { getKnownRefs } from "@/lib/refs";
import { getSettings } from "@/lib/settings";
import { STAGE_LABELS } from "@/lib/queue-stages";
import { pageMeta } from "@/lib/site";
import RefLookup from "@/components/RefLookup";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "Part number lookup — the reference registry | Evocation",
  description:
    "Check any discontinued OEM part number: revived and back in production, in the resurrection queue, or waiting for its first request. Interior & trim parts for classics and youngtimers.",
  path: "/ref",
});

/* The reference registry hub (chantier G): look up any OEM number, and browse
   every reference the site knows — each links to its own status page. */
export default async function RefIndexPage() {
  const [refs, settings] = await Promise.all([getKnownRefs(), getSettings()]);
  const revived = refs.filter((r) => r.status === "revived");
  const queued = refs.filter((r) => r.status === "queued");

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <div className="wrap relative max-w-[820px]">
        <SectionNo>The reference registry</SectionNo>
        <div className="mb-8">
          <Reveal>
            <h1 className="font-display max-w-[22ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              Is your part number{" "}
              <em className="text-brg not-italic">still made?</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-5 max-w-[52ch] text-ink-soft">
            Type the original number printed on your part. We&apos;ll tell you
            if it&apos;s been revived, if other owners are already voting for
            it — or how to be the first to request it.
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <RefLookup />
        </Reveal>

        {revived.length > 0 && (
          <Reveal delay={0.1} className="mt-[clamp(36px,5vw,60px)]">
            <h2 className="label-mono mb-3 flex items-center gap-3 !text-[0.7rem] !tracking-[0.16em] text-brg after:h-px after:flex-1 after:bg-hairline after:content-['']">
              Revived — back in production
            </h2>
            <ul className="border-t border-hairline">
              {revived.map((r) => (
                <li key={r.ref}>
                  <a
                    href={`/ref/${r.ref}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-hairline py-3.5 no-underline"
                  >
                    <span className="font-mono text-[0.9rem] text-ink transition-colors group-hover:text-brg">
                      {r.display}
                    </span>
                    <span className="label-mono !text-[0.62rem] text-ink-soft">
                      {[r.vehicle, r.product?.name].filter(Boolean).join(" — ")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {queued.length > 0 && (
          <Reveal delay={0.1} className="mt-[clamp(28px,4vw,44px)]">
            <h2 className="label-mono mb-3 flex items-center gap-3 !text-[0.7rem] !tracking-[0.16em] text-gold after:h-px after:flex-1 after:bg-hairline after:content-['']">
              In the resurrection queue
            </h2>
            <ul className="border-t border-hairline">
              {queued.map((r) => (
                <li key={r.ref}>
                  <a
                    href={`/ref/${r.ref}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-hairline py-3.5 no-underline"
                  >
                    <span className="font-mono text-[0.9rem] text-ink transition-colors group-hover:text-brg">
                      {r.display}
                    </span>
                    <span className="label-mono !text-[0.62rem] text-ink-soft">
                      {r.stage !== "queued"
                        ? STAGE_LABELS[r.stage!]
                        : `${r.count} / ${settings.queueVoteTarget} votes`}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.1} className="mt-[clamp(24px,3vw,44px)]">
          <a
            href="/#queue"
            className="group flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink-soft/50 px-5 py-4 transition-colors hover:border-brg"
          >
            <span className="text-[0.95rem] text-ink-soft">
              Your number isn&apos;t listed? Requests are how every revival
              starts.
            </span>
            <span className="label-mono flex items-center gap-1.5 text-brg">
              Request it{" "}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </main>
  );
}
