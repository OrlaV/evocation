"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { orderNoLabel } from "@/lib/order-emails";
import { updateReturnAction } from "@/app/admin/actions";

const STATUSES = ["open", "approved", "declined", "resolved"] as const;

export type AdminReturn = {
  id: string;
  order_id: string;
  email: string | null;
  reason: string;
  details: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  order_no: number | null;
};

function Row({ r }: { r: AdminReturn }) {
  const router = useRouter();
  const [status, setStatus] = useState(r.status);
  const [note, setNote] = useState(r.admin_note ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updateReturnAction({ id: r.id, status, note });
      setMsg(res.msg);
      if (res.ok) router.refresh();
    });

  return (
    <div className="border border-hairline p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-mono text-[0.85rem] font-semibold">
            {orderNoLabel(r.order_no)}
          </span>
          <span className="label-mono ml-2 !text-[0.62rem] text-brg">
            {r.reason}
          </span>
        </div>
        <span className="label-mono !text-[0.62rem] text-ink-soft">
          {new Date(r.created_at).toLocaleDateString("en-GB")} · {r.email ?? "—"}
        </span>
      </div>
      {r.details && (
        <p className="mt-2 text-[0.9rem] text-ink-soft">{r.details}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-hairline bg-transparent px-2.5 py-2 font-mono !text-[0.78rem] outline-none focus:border-brg"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note"
          className="min-w-[180px] flex-1 border border-hairline bg-transparent px-2.5 py-2 font-mono !text-[0.78rem] outline-none focus:border-brg"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="label-mono cursor-pointer bg-brg px-3.5 py-2 !text-[0.64rem] text-cream disabled:opacity-60"
        >
          {pending ? "…" : "Save"}
        </button>
        <a
          href="/admin/orders"
          className="label-mono !text-[0.64rem] text-ink-soft underline-offset-2 hover:text-brg hover:underline"
        >
          Refund in orders →
        </a>
      </div>
      {msg && (
        <div className="label-mono mt-2 !text-[0.62rem] text-ink-soft">{msg}</div>
      )}
    </div>
  );
}

export default function ReturnsAdmin({ returns }: { returns: AdminReturn[] }) {
  if (returns.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
        No return requests yet. They land here when a customer raises one from
        their account — approve, then refund from the order.
      </div>
    );
  }
  return (
    <div className="mt-8 space-y-4">
      {returns.map((r) => (
        <Row key={r.id} r={r} />
      ))}
    </div>
  );
}
