import DocPage, { H2, P } from "@/components/DocPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "The Process | Evocation",
  description:
    "How Evocation revives a part: source a good original, 3D-scan it, redraw it, print in engineering polymers, and hand-finish to an OEM-style grain.",
  path: "/process",
});

const STEPS = [
  {
    n: "01",
    t: "Source the original",
    d: "We find a good, unbroken original — often donated or lent by an owner — as the reference. Geometry that's spent 30+ years in a car has to be captured exactly.",
  },
  {
    n: "02",
    t: "3D-scan",
    d: "We scan the part to a high-resolution mesh: every clip, rib and radius that has to line up with the car. This is the difference between a part that snaps home and one that almost fits.",
  },
  {
    n: "03",
    t: "Redraw to spec",
    d: "The scan is rebuilt into a clean, watertight model — fixing the warping and shrinkage of the aged original, and tuning clip tension so it mounts like new.",
  },
  {
    n: "04",
    t: "Print in engineering polymer",
    d: "Printed to order in automotive-grade material chosen for the part — heat-stable for cabin temperatures (80–90°C) and UV-aware, not brittle hobby plastic.",
  },
  {
    n: "05",
    t: "Hand-finish the grain",
    d: "Here's where it stops looking printed: a textured, OEM-style grain is applied by hand so the surface and sheen read like the factory part. No visible print layers.",
  },
  {
    n: "06",
    t: "Check, stamp & ship",
    d: "Each part is checked against the reference, stamped “Evocation”, and shipped from the UK. Fits or refunded.",
  },
];

export default function ProcessPage() {
  return (
    <DocPage
      kicker="The craft"
      title="How a part comes back"
      intro="“It's just 3D-printed plastic” is the first thing people think. Here's why these aren't that."
    >
      {/* hero/video placeholder — swap for a 15–30s post-treatment clip when ready */}
      <div className="hatch mt-2 flex aspect-[16/7] items-center justify-center border border-hairline">
        <span className="label-mono border border-dashed border-ink-soft bg-cream px-3.5 py-2 !text-[0.7rem] text-ink-soft">
          Video — scan to finished part (15–30s)
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-9 min-[720px]:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.n} className="border-t border-hairline pt-4">
            <div className="flex items-baseline gap-3">
              <span className="font-num text-[1.6rem] leading-none text-brg">
                {s.n}
              </span>
              <h2 className="font-display text-[1.18rem] font-bold">{s.t}</h2>
            </div>
            <p className="mt-2 text-[0.96rem] leading-[1.65] text-ink-soft">
              {s.d}
            </p>
          </div>
        ))}
      </div>

      <H2>Why it lasts</H2>
      <P>
        We pick the polymer per part, not one material for everything. The
        originals usually failed because 1980s plastics go brittle under heat
        and sunlight — so we choose materials that hold up to cabin temperatures
        and UV, and tune the geometry to mount without stress cracks.
      </P>

      <H2>Honest by design</H2>
      <P>
        Every part is sold as a pattern part, stamped Evocation, with the
        original manufacturer reference quoted so you know exactly what it
        replaces. We&rsquo;re not affiliated with any manufacturer — we just
        make the part you can&rsquo;t buy anymore.
      </P>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="/shop"
          className="label-mono border border-transparent bg-brg px-6 py-3.5 text-cream transition-colors hover:bg-brg-deep"
        >
          Browse the registry
        </a>
        <a
          href="/#queue"
          className="label-mono border border-ink px-6 py-3.5 text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Request a part
        </a>
      </div>
    </DocPage>
  );
}
