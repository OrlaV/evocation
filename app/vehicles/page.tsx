import { getVehiclePages } from "@/lib/vehicle-pages";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";
import { pageMeta } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "Parts by vehicle — Evocation",
  description:
    "Browse revived interior & trim parts by car. Discontinued (NLA) and hard-to-find pieces for classics and youngtimers, remade with an OEM-grain finish and shipped worldwide.",
  path: "/vehicles",
});

export default async function VehiclesIndex() {
  const vehicles = await getVehiclePages();

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <div className="wrap relative">
        <SectionNo>Parts by vehicle</SectionNo>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h1 className="font-display max-w-[22ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              Find parts for{" "}
              <em className="text-brg not-italic">your car.</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-[46ch] text-ink-soft">
            Every vehicle we&apos;ve revived a part for. Don&apos;t see yours?
            Most revivals start as a request.
          </Reveal>
        </div>

        {vehicles.length === 0 ? (
          <div className="border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
            The registry is warming up. Put your car in the{" "}
            <a href="/#queue" className="text-brg hover:underline">
              queue
            </a>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[clamp(8px,1vw,14px)] min-[641px]:grid-cols-2 min-[961px]:grid-cols-3">
            {vehicles.map((v) => (
              <a
                key={v.slug}
                href={`/vehicles/${v.slug}`}
                className="group flex items-center justify-between gap-3 border border-hairline bg-cream-card px-5 py-4 no-underline transition-colors hover:border-ink"
              >
                <span>
                  <span className="block font-display text-[1.05rem] font-bold text-ink">
                    {v.make} {v.model}
                  </span>
                  <span className="label-mono !text-[0.62rem] text-ink-soft">
                    {v.products.length} part{v.products.length > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="text-brg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
