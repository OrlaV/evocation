import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { emailConfigured } from "@/lib/email";
import OrdersAdmin, { type AdminOrder } from "@/components/admin/OrdersAdmin";

export const metadata: Metadata = {
  title: "Orders — Evocation admin",
  robots: { index: false },
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_no, created_at, email, user_id, amount_pence, items, shipping, status, tracking_number, shipped_at, refunded_at",
    )
    .order("created_at", { ascending: false });
  const orders = (data as AdminOrder[]) ?? [];
  const open = orders.filter((o) => o.status === "paid" || o.status === "printed").length;

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[920px]">
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
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">Orders</h1>
          </div>
          <div className="label-mono !text-[0.7rem] text-ink-soft">
            {orders.length} order{orders.length === 1 ? "" : "s"} · {open} to
            fulfil
          </div>
        </div>

        <OrdersAdmin orders={orders} emailReady={emailConfigured()} />
      </div>
    </main>
  );
}
