import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import ReturnsAdmin, { type AdminReturn } from "@/components/admin/ReturnsAdmin";

export const metadata: Metadata = {
  title: "Returns — Evocation admin",
  robots: { index: false },
};

type Row = {
  id: string;
  order_id: string;
  email: string | null;
  reason: string;
  details: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  orders: { order_no: number | null } | null;
};

export default async function AdminReturnsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("return_requests")
    .select(
      "id, order_id, email, reason, details, status, admin_note, created_at, orders(order_no)",
    )
    .order("created_at", { ascending: false });
  const rows = (data as Row[] | null) ?? [];
  const returns: AdminReturn[] = rows.map((r) => ({
    id: r.id,
    order_id: r.order_id,
    email: r.email,
    reason: r.reason,
    details: r.details,
    status: r.status,
    admin_note: r.admin_note,
    created_at: r.created_at,
    order_no: r.orders?.order_no ?? null,
  }));
  const open = returns.filter((r) => r.status === "open").length;

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[900px]">
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
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">Returns</h1>
          </div>
          <div className="label-mono !text-[0.7rem] text-ink-soft">
            {returns.length} total · {open} open
          </div>
        </div>
        <ReturnsAdmin returns={returns} />
      </div>
    </main>
  );
}
