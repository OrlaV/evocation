"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/types";
import { orderNoLabel, royalMailTrackingUrl } from "@/lib/order-emails";
import {
  updateOrderAction,
  refundOrderAction,
  resendConfirmationAction,
} from "@/app/admin/actions";

const CLICK_AND_DROP = "https://business.parcel.royalmail.com/";
const STATUSES = ["paid", "printed", "shipped", "refunded"] as const;

export type AdminOrder = {
  id: string;
  order_no: number | null;
  created_at: string;
  email: string | null;
  user_id: string | null;
  amount_pence: number | null;
  items: { name?: string | null; qty?: number | null }[] | null;
  shipping: unknown;
  status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  refunded_at: string | null;
};

type Addr = {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

function shippingAddress(shipping: unknown): {
  name: string | null;
  phone: string | null;
  lines: string[];
} {
  if (!shipping || typeof shipping !== "object")
    return { name: null, phone: null, lines: [] };
  const s = shipping as {
    name?: string | null;
    phone?: string | null;
    address?: Addr;
  } & Addr;
  const a: Addr = s.address ?? s;
  const lines = [
    a.line1,
    a.line2,
    [a.postal_code, a.city].filter(Boolean).join(" "),
    a.state,
    a.country,
  ].filter((x): x is string => Boolean(x && x.trim()));
  return { name: s.name ?? null, phone: s.phone ?? null, lines };
}

const statusStyle: Record<string, string> = {
  paid: "border-ink-soft text-ink-soft",
  printed: "border-gold text-gold",
  shipped: "border-brg text-brg",
  refunded: "border-ink-soft text-ink-soft line-through",
};

function OrderCard({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, start] = useTransition();

  const { name, phone, lines } = shippingAddress(order.shipping);
  const items = (order.items ?? [])
    .map((i) => `${i.qty ?? 1}× ${i.name ?? "Part"}`)
    .join(", ");
  const refunded = order.status === "refunded";

  const run = (fn: () => Promise<{ ok: boolean; msg: string }>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      setMsg({ text: r.msg, ok: r.ok });
      if (r.ok) router.refresh();
    });

  const save = () =>
    run(() => updateOrderAction({ id: order.id, status, tracking_number: tracking }));
  const resend = () => run(() => resendConfirmationAction(order.id));
  const refund = () => {
    if (
      !window.confirm(
        `Refund ${formatPrice(order.amount_pence ?? 0)} to ${order.email ?? "the customer"} via Stripe? This can't be undone.`,
      )
    )
      return;
    run(() => refundOrderAction(order.id));
  };

  return (
    <div className="border border-hairline p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-num text-[1.3rem] leading-none">
            {orderNoLabel(order.order_no)}
          </span>
          <span
            className={`label-mono border px-2 py-[2px] !text-[0.62rem] ${statusStyle[order.status] ?? ""}`}
          >
            {order.status}
          </span>
          <span className="label-mono !text-[0.66rem] text-ink-soft">
            {new Date(order.created_at).toLocaleDateString("en-GB")}
          </span>
        </div>
        <span className="font-mono text-[0.95rem] font-semibold">
          {order.amount_pence != null ? formatPrice(order.amount_pence) : "—"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
        <div className="text-[0.9rem]">
          <div className="label-mono !text-[0.6rem] text-ink-soft">Items</div>
          <div className="mt-1">{items || "—"}</div>
          <div className="label-mono mt-3 !text-[0.6rem] text-ink-soft">
            Customer
          </div>
          <div className="mt-1 font-mono text-[0.82rem]">
            {order.email ?? "—"}
            {order.user_id && (
              <span className="label-mono ml-2 !text-[0.58rem] text-brg">
                account
              </span>
            )}
          </div>
        </div>
        <div className="text-[0.9rem]">
          <div className="label-mono !text-[0.6rem] text-ink-soft">
            Ship to
          </div>
          {name && <div className="mt-1 font-medium">{name}</div>}
          {lines.length ? (
            <div className="text-ink-soft">
              {lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-ink-soft">No address on file</div>
          )}
          {phone && (
            <div className="mt-1 font-mono text-[0.8rem] text-ink-soft">
              ☎ {phone}
            </div>
          )}
        </div>
      </div>

      {/* fulfilment controls */}
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-hairline pt-4">
        <label className="flex flex-col gap-1">
          <span className="label-mono !text-[0.6rem] text-ink-soft">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="cursor-pointer border border-hairline bg-transparent px-3 py-2 font-mono text-[0.8rem] outline-none focus:border-ink"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="label-mono !text-[0.6rem] text-ink-soft">
            Royal Mail tracking no.
          </span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="e.g. AB123456785GB"
            className="border border-hairline bg-transparent px-3 py-2 font-mono text-[0.8rem] outline-none focus:border-ink"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="label-mono cursor-pointer bg-brg px-4 py-2 text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {pending ? "…" : "Save"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={CLICK_AND_DROP}
          target="_blank"
          rel="noopener noreferrer"
          className="label-mono border border-ink px-3 py-2 !text-[0.64rem] text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Create label · Royal Mail ↗
        </a>
        {tracking.trim() && (
          <a
            href={royalMailTrackingUrl(tracking)}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono !text-[0.64rem] text-brg hover:underline"
          >
            Track ↗
          </a>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={resend}
          disabled={pending}
          className="label-mono cursor-pointer !text-[0.64rem] text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
        >
          Resend confirmation
        </button>
        {!refunded && (
          <button
            type="button"
            onClick={refund}
            disabled={pending}
            className="label-mono cursor-pointer border border-ink-soft px-3 py-2 !text-[0.64rem] text-ink-soft transition-colors hover:border-brg hover:text-brg disabled:opacity-60"
          >
            Refund via Stripe
          </button>
        )}
      </div>

      {msg && (
        <div
          className={`label-mono mt-3 !text-[0.64rem] ${msg.ok ? "text-brg" : "text-ink-soft"}`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}

export default function OrdersAdmin({
  orders,
  emailReady,
}: {
  orders: AdminOrder[];
  emailReady: boolean;
}) {
  return (
    <div className="mt-8 space-y-4">
      {!emailReady && (
        <div className="label-mono border border-gold px-4 py-3 !text-[0.66rem] !tracking-[0.06em] text-gold">
          Email is off — set RESEND_FROM (a verified Resend domain) to send
          confirmation / shipped / refund emails. Status changes still save.
        </div>
      )}
      {orders.length === 0 ? (
        <div className="border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
          No orders yet.
        </div>
      ) : (
        orders.map((o) => <OrderCard key={o.id} order={o} />)
      )}
    </div>
  );
}
