import Reveal from "./Reveal";
import SectionNo from "./SectionNo";
import GhostNumeral from "./GhostNumeral";

const SPECS = [
  "Materials matched to the part — ASA / PA6-CF",
  "Holds shape past 95 °C",
  "Hand-applied OEM grain",
  "Stamped Evocation — pattern part",
];

export default function Proof() {
  return (
    <section
      id="proof"
      className="relative overflow-hidden border-t border-hairline bg-cream-deep py-[clamp(76px,11vh,140px)]"
    >
      <div className="wrap relative">
        <GhostNumeral n="02" />
        <SectionNo>§ 02 — The Finish</SectionNo>
        <div className="grid grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] min-[981px]:grid-cols-[5fr_7fr]">
          <div>
            <Reveal as="h2" className="font-display max-w-[20ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              OEM-grain finish.{" "}
              <em className="text-brg not-italic">No visible layers.</em>
            </Reveal>
            <Reveal as="p" delay={0.1} className="my-5 mb-7 max-w-[46ch] text-ink-soft">
              Every part starts as a 3D scan of an original, then is printed
              in the right engineering polymer for the job — automotive-grade
              ASA for trim, carbon-reinforced nylon where strength matters —
              and hand-finished with a textured coating that restores the
              factory grain. If you can tell it apart from the original, we
              want to know.
            </Reveal>
            <Reveal delay={0.2} className="flex flex-col gap-2.5 border-t border-hairline pt-5">
              {SPECS.map((spec) => (
                <span
                  key={spec}
                  className="label-mono flex items-center gap-2.5 !text-[0.72rem] !tracking-[0.1em] text-ink-soft"
                >
                  <span className="inline-block h-1 w-1 shrink-0 bg-brg" />
                  {spec}
                </span>
              ))}
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <figure>
              <div className="hatch relative flex min-h-[clamp(360px,46vh,520px)] items-center justify-center border border-hairline">
                <span className="label-mono border border-dashed border-ink-soft bg-cream-deep px-4 py-2.5 !text-[0.72rem] text-ink-soft">
                  Photo — macro, OEM grain finish
                </span>
              </div>
              <figcaption className="label-mono mt-3.5 flex justify-between gap-4 border-t border-hairline pt-2.5 !text-[0.72rem] !tracking-[0.12em] text-ink-soft">
                <span>Fig. 2 — Macro · grain &amp; finish · scale 1:1</span>
                <span>Placeholder</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
