import type { Metadata } from "next";
import { requireUser } from "@/lib/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/types";
import { orderNoLabel, royalMailTrackingUrl } from "@/lib/order-emails";
import SignOutButton from "@/components/admin/SignOutButton";

export const metadata: Metadata = {
  title: "Your garage — Evocation",
  robots: { index: false },
};

type OrderRow = {
  id: string;
  order_no: number | null;
  amount_pence: number | null;
  // items are written by the Stripe webhook as { name, qty, amount_pence }
  items:
    | { name?: string | null; evo_no?: string; qty?: number | null }[]
    | null;
  status: string;
  tracking_number: string | null;
  created_at: string;
};

type RequestRow = {
  id: string;
  part_label: string;
  make: string | null;
  model: string | null;
  kind: string | null;
  notified_at: string | null;
  created_at: string;
};

export default async function AccountPage() {
  const user = await requireUser();

  // session client: RLS ("customers read own orders" / "read own requests")
  // scopes both queries to the signed-in user — no service role on a
  // customer-facing page.
  const supabase = await createSupabaseServerClient();
  const [{ data }, { data: reqData }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_no, amount_pence, items, status, tracking_number, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("queue_requests")
      .select("id, part_label, make, model, kind, notified_at, created_at")
      .order("created_at", { ascending: false }),
  ]);
  const orders = (data as OrderRow[]) ?? [];
  // the parts this account has asked for / voted on (exclude anonymous buy-intent)
  const requests = ((reqData as RequestRow[]) ?? []).filter(
    (r) => r.kind !== "order_intent",
  );

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[860px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label-mono !tracking-[0.18em] text-brg">
              Your garage
            </div>
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">
              Account
            </h1>
            <div className="mt-1 font-mono text-[0.82rem] text-ink-soft">
              {user.email}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/account/profile"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Profile &amp; address →
            </a>
            <SignOutButton redirectTo="/" />
          </div>
        </div>

        <div className="label-mono mt-10 mb-4 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
          Orders
        </div>

        {orders.length === 0 ? (
          <div className="border border-dashed border-ink-soft/65 px-6 py-10 text-center">
            <p className="text-ink-soft">
              No orders yet — your future parts will live here, each covered
              by the fit guarantee.
            </p>
            <a
              href="/shop"
              className="label-mono mt-4 inline-block border border-transparent bg-brg px-5 py-3 text-cream transition-colors hover:bg-brg-deep"
            >
              Browse the registry
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border-t border-hairline">
            <thead>
              <tr>
                {["Order", "Date", "Parts", "Total", "Status"].map((h) => (
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
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.78rem] font-semibold">
                    {orderNoLabel(o.order_no)}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.78rem] text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 text-[0.92rem]">
                    {(o.items ?? [])
                      .map(
                        (it) =>
                          `${it.name ?? it.evo_no ?? "Part"} ×${it.qty ?? 1}`,
                      )
                      .join(", ")}
                  </td>
                  <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.82rem]">
                    {o.amount_pence != null ? formatPrice(o.amount_pence) : "—"}
                  </td>
                  <td className="border-b border-hairline py-3.5">
                    <span className="label-mono border border-brg px-2 py-[2px] !text-[0.62rem] text-brg">
                      {o.status}
                    </span>
                    {o.tracking_number && (
                      <a
                        href={royalMailTrackingUrl(o.tracking_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="label-mono mt-1.5 block !text-[0.6rem] text-ink-soft hover:text-brg"
                      >
                        Track ↗ {o.tracking_number}
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        <div className="label-mono mt-8 !text-[0.66rem] !tracking-[0.1em] text-ink-soft/80">
          Every part is covered: fits or refunded, and exchanged if it fails
          through a fault of ours — write to us with your order date.
        </div>

        {/* parts this account has asked for / backed in the resurrection queue */}
        <div className="label-mono mt-14 mb-4 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
          Requests &amp; votes
        </div>
        {requests.length === 0 ? (
          <div className="border border-dashed border-ink-soft/65 px-6 py-8 text-center">
            <p className="text-ink-soft">
              You haven&apos;t backed a part yet. Can&apos;t find yours?
            </p>
            <a
              href="/#queue"
              className="label-mono mt-3 inline-block border border-hairline px-5 py-3 text-ink-soft transition-colors hover:border-brg hover:text-brg"
            >
              Add it to the queue →
            </a>
          </div>
        ) : (
          <ul className="border-t border-hairline">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline py-3.5"
              >
                <div>
                  <div className="text-[0.95rem]">{r.part_label}</div>
                  {(r.make || r.model) && (
                    <div className="label-mono !text-[0.62rem] text-ink-soft">
                      {[r.make, r.model].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <span
                  className={`label-mono border px-2 py-[2px] !text-[0.6rem] ${
                    r.notified_at
                      ? "border-brass text-brass"
                      : "border-hairline text-ink-soft"
                  }`}
                >
                  {r.notified_at ? "Revived — notified" : "In the queue"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
