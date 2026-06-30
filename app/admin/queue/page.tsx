import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Resurrection queue — Evocation admin",
  robots: { index: false },
};

type Row = {
  part_label: string;
  ref_normalized: string | null;
  make: string | null;
  model: string | null;
  email: string;
  created_at: string;
};

type Group = {
  label: string;
  ref: string | null;
  vehicle: string | null;
  emails: Set<string>;
  requests: number;
  latest: string;
};

function vehicleLabel(r: Row): string | null {
  if (!r.make) return null;
  return r.model ? `${r.make} · ${r.model}` : r.make;
}

export default async function AdminQueuePage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("queue_requests")
    .select("part_label, ref_normalized, make, model, email, created_at")
    .neq("kind", "order_intent")
    .order("created_at", { ascending: false });
  const rows = (data as Row[]) ?? [];

  const groups = new Map<string, Group>();
  for (const r of rows) {
    const key = r.ref_normalized ?? r.part_label.trim().toLowerCase();
    const g = groups.get(key);
    if (g) {
      g.emails.add(r.email.toLowerCase());
      g.requests += 1;
      if (!g.vehicle) g.vehicle = vehicleLabel(r);
      if (r.created_at > g.latest) g.latest = r.created_at;
    } else {
      groups.set(key, {
        label: r.part_label,
        ref: r.ref_normalized,
        vehicle: vehicleLabel(r),
        emails: new Set([r.email.toLowerCase()]),
        requests: 1,
        latest: r.created_at,
      });
    }
  }
  const sorted = [...groups.values()].sort(
    (a, b) => b.emails.size - a.emails.size || (a.latest < b.latest ? 1 : -1),
  );

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
              The resurrection queue
            </h1>
          </div>
          <div className="label-mono !text-[0.7rem] text-ink-soft">
            {rows.length} request{rows.length === 1 ? "" : "s"} ·{" "}
            {sorted.length} distinct part{sorted.length === 1 ? "" : "s"}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
            No requests yet. They'll land here as soon as someone joins the
            queue on the homepage.
          </div>
        ) : (
          <table className="mt-8 w-full border-collapse border-t border-hairline">
            <thead>
              <tr>
                {["Part requested", "Vehicle", "Ref.", "Waiting", "Requests", "Last request"].map(
                  (h) => (
                    <th
                      key={h}
                      className="label-mono border-b border-hairline py-3 pr-3 text-left !text-[0.66rem] !tracking-[0.12em] text-ink-soft"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((g, i) => (
                <tr key={i}>
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.95rem] font-medium">
                    {g.label}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.82rem] text-ink-soft">
                    {g.vehicle ?? "—"}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.75rem] text-brass">
                    {g.ref ?? "—"}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.85rem] text-brg">
                    {g.emails.size}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.8rem] text-ink-soft">
                    {g.requests}
                  </td>
                  <td className="border-b border-hairline py-3.5 font-mono text-[0.78rem] text-ink-soft">
                    {new Date(g.latest).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="label-mono mt-6 !text-[0.66rem] !tracking-[0.1em] text-ink-soft/80">
          Waiting = distinct emails per part. When a part ships, export the
          emails from Supabase to announce the revival.
        </p>
      </div>
    </main>
  );
}
