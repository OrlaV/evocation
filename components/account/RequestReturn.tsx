"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createReturnAction } from "@/app/account/actions";

const REASONS = [
  { value: "doesn't fit", label: "Doesn't fit" },
  { value: "faulty", label: "Faulty / our fault" },
  { value: "other", label: "Other" },
];

/* Per-order "fits or refunded" self-service. Shows the current return status if
   one exists, otherwise a small form to raise one. */
export default function RequestReturn({
  orderId,
  existingStatus,
  refunded,
}: {
  orderId: string;
  existingStatus?: string | null;
  refunded: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("doesn't fit");
  const [details, setDetails] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (refunded) {
    return <span className="label-mono !text-[0.6rem] text-ink-soft/70">—</span>;
  }
  if (existingStatus) {
    return (
      <span className="label-mono border border-hairline px-2 py-[2px] !text-[0.58rem] text-ink-soft">
        Return: {existingStatus}
      </span>
    );
  }

  const submit = () => {
    setErr(null);
    start(async () => {
      const r = await createReturnAction({ orderId, reason, details });
      if (r.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setErr(r.error ?? "Couldn't submit.");
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label-mono cursor-pointer !text-[0.6rem] text-brg transition-colors hover:text-brg-deep"
      >
        Request return
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="Return reason"
        className="border border-hairline bg-transparent px-2 py-1.5 font-mono !text-[0.7rem] outline-none focus:border-brg"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="border border-hairline bg-transparent px-2 py-1.5 font-mono !text-[0.7rem] outline-none focus:border-brg"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="label-mono cursor-pointer bg-brg px-2.5 py-1.5 !text-[0.6rem] text-cream disabled:opacity-60"
        >
          {pending ? "…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="label-mono cursor-pointer !text-[0.6rem] text-ink-soft"
        >
          Cancel
        </button>
      </div>
      {err && <div className="label-mono !text-[0.58rem] text-brg">{err}</div>}
    </div>
  );
}
