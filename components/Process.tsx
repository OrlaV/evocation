import Reveal from "./Reveal";
import SectionNo from "./SectionNo";
import GhostNumeral from "./GhostNumeral";

const STEPS = [
  {
    no: "STEP 01",
    title: "3D-scan & redraw",
    body: "Every revival starts as a high-resolution 3D scan of an original — capturing the details the eye misses, like draft angles and grain direction.",
  },
  {
    no: "STEP 02",
    title: "Print to spec",
    body: "Printed in the right engineering polymer for the part — automotive-grade ASA, or carbon-reinforced nylon when it demands more. Never brittle hobby plastics.",
  },
  {
    no: "STEP 03",
    title: "Hand finish",
    body: "Each part is finished with a textured OEM-style grain. No visible print layers. It belongs in the car.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-hairline bg-ink py-[clamp(76px,11vh,140px)] text-cream"
    >
      <div className="wrap relative">
        <GhostNumeral n="03" dark />
        <SectionNo dark>§ 03 — The Process</SectionNo>
        <Reveal as="h2" className="font-display max-w-[20ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
          From a worn original to a{" "}
          <em className="text-brg-light not-italic">faithful revival.</em>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 border-t border-hairline-dark min-[861px]:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.no}
              delay={i * 0.1}
              className={`pt-8 pb-7 min-[861px]:mr-7 min-[861px]:pr-7 min-[861px]:pb-2 ${
                i < 2
                  ? "border-b border-hairline-dark min-[861px]:border-r min-[861px]:border-b-0"
                  : ""
              }`}
            >
              <div className="font-num text-[1.6rem] leading-none text-brg-light">
                {step.no.replace("STEP ", "")}
              </div>
              <h3 className="font-display my-3.5 mb-2.5 text-[1.35rem] font-bold">
                {step.title}
              </h3>
              <p className="max-w-[34ch] text-[0.95rem] font-medium text-cream/75">
                {step.body}
              </p>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
