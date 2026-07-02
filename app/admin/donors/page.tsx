import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import DonorStatusSelect from "@/components/admin/DonorStatusSelect";

export const metadata: Metadata = {
  title: "Donor offers — Evocation admin",
  robots: { index: false },
};

type DonorRow = {
  id: string;
  email: string;
  make: string | null;
  model: string | null;
  part_label: string;
  ref_normalized: string | null;
  condition: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  public_name: string | null;
  display_consent: boolean;
};

export default async function AdminDonorsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("donor_offers")
    .select(
      "id, email, make, model, part_label, ref_normalized, condition, notes, status, created_at, public_name, display_consent",
    )
    .order("created_at", { ascending: false });
  const rows = (data as DonorRow[]) ?? [];
  const pending = rows.filter((r) => r.status === "new").length;

  return (
    <main className="flex-1 py-12">
      <div className="wrap">
        <a
          href="/admin"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to registry admin
        </a>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label-mono !tracking-[0.18em] text-brg">
              Workshop
            </div>
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">
              Donor offers
            </h1>
          </div>
          <div className="label-mono !text-[0.7rem] text-ink-soft">
            {rows.length} offer{rows.length === 1 ? "" : "s"} · {pending} new
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
            No donor offers yet. They land here when an owner offers to lend us
            an original from the queue.
          </div>
        ) : (
          <table className="mt-8 w-full border-collapse border-t border-hairline">
            <thead>
              <tr>
                {[
                  "Part",
                  "Vehicle",
                  "Ref.",
                  "Condition",
                  "Contact",
                  "Wall credit",
                  "Status",
                  "Received",
                ].map((h) => (
                  <th
                    key={h}
                    className="label-mono border-b border-hairline py-3 pr-3 text-left !text-[0.66rem] !tracking-[0.12em] text-ink-soft"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.95rem] font-medium">
                    {r.part_label}
                    {r.notes && (
                      <div className="mt-1 text-[0.78rem] font-normal text-ink-soft">
                        {r.notes}
                      </div>
                    )}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.82rem] text-ink-soft">
                    {r.make ? (r.model ? `${r.make} · ${r.model}` : r.make) : "—"}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.75rem] text-brass">
                    {r.ref_normalized ?? "—"}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.82rem] text-ink-soft">
                    {r.condition ?? "—"}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.78rem] text-ink-soft">
                    {r.email}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.82rem]">
                    {r.display_consent && r.public_name ? (
                      <span className="text-ink">{r.public_name}</span>
                    ) : (
                      <span className="text-ink-soft/70">anonymous</span>
                    )}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3">
                    <DonorStatusSelect id={r.id} status={r.status} />
                  </td>
                  <td className="border-b border-hairline py-3.5 font-mono text-[0.78rem] text-ink-soft">
                    {new Date(r.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="label-mono mt-6 !text-[0.66rem] !tracking-[0.1em] text-ink-soft/80">
          The deal: owner sends the original → we 3D-scan & inspect → we return
          their part plus a free printed copy. Offers marked received or
          returned appear on the public donor wall (/donors) — named only when
          the donor opted in.
        </p>
      </div>
    </main>
  );
}
