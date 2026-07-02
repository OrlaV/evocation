import { createServiceClient } from "@/lib/supabase-server";
import { hasSupabase } from "@/lib/supabase";
import { pageMeta } from "@/lib/site";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "The donor wall — owners who saved a part | Evocation",
  description:
    "Every revival starts with an original. These owners lent us theirs to 3D-scan — we returned it with a free printed copy, and the part lives on for everyone.",
  path: "/donors",
});

type WallRow = {
  id: string;
  make: string | null;
  model: string | null;
  part_label: string;
  public_name: string | null;
  display_consent: boolean;
  status: string;
  created_at: string;
};

/* Public credit for the donor programme: only offers that physically reached
   the workshop (received/returned) appear, and a name shows ONLY when the
   donor opted in at submission time — everyone else is an anonymous owner. */
export default async function DonorsPage() {
  let rows: WallRow[] = [];
  if (hasSupabase()) {
    const { data } = await createServiceClient()
      .from("donor_offers")
      .select(
        "id, make, model, part_label, public_name, display_consent, status, created_at",
      )
      .in("status", ["received", "returned"])
      .order("created_at", { ascending: false });
    rows = (data as WallRow[]) ?? [];
  }

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <div className="wrap relative max-w-[820px]">
        <SectionNo>The donor wall</SectionNo>
        <div className="mb-10">
          <Reveal>
            <h1 className="font-display max-w-[22ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              Every revival starts with{" "}
              <em className="text-brg not-italic">someone&apos;s original.</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-5 max-w-[52ch] text-ink-soft">
            These owners lent us the last good example of a discontinued part.
            We 3D-scanned it, returned it to them with a free printed copy —
            and the part lives on for every other owner. That&apos;s
            preservation, one piece of trim at a time.
          </Reveal>
        </div>

        {rows.length === 0 ? (
          <div className="border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
            The wall is waiting for its first donor.{" "}
            <a href="/#queue" className="text-brg hover:underline">
              Have an original we should scan? →
            </a>
          </div>
        ) : (
          <ul className="border-t border-hairline">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hairline py-4"
              >
                <div>
                  <div className="text-[1rem]">{r.part_label}</div>
                  <div className="label-mono !text-[0.62rem] text-ink-soft">
                    {[
                      r.make
                        ? r.model
                          ? `${r.make} · ${r.model}`
                          : r.make
                        : null,
                      r.status === "returned"
                        ? "scanned & returned"
                        : "in the workshop",
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.92rem] text-brg">
                    {r.display_consent && r.public_name
                      ? r.public_name
                      : "An anonymous owner"}
                  </div>
                  <div className="label-mono !text-[0.6rem] text-ink-soft">
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Reveal delay={0.1} className="mt-[clamp(24px,3vw,44px)]">
          <a
            href="/#queue"
            className="group flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink-soft/50 px-5 py-4 transition-colors hover:border-brg"
          >
            <span className="text-[0.95rem] text-ink-soft">
              Have an original in the glovebox? Lend it — you get it back, plus
              a free printed copy.
            </span>
            <span className="label-mono flex items-center gap-1.5 text-brg">
              Offer my original{" "}
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
