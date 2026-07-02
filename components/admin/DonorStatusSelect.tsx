"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDonorStatusAction } from "@/app/admin/actions";

const STATUSES = ["new", "accepted", "received", "returned", "declined"] as const;

/* Per-row status control on /admin/donors (replaces editing rows in Supabase).
   'received' and 'returned' offers appear on the public donor wall. */
export default function DonorStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const change = (next: string) => {
    const prev = value;
    setValue(next);
    setErr(null);
    start(async () => {
      const res = await updateDonorStatusAction({ id, status: next });
      if (!res.ok) {
        setValue(prev);
        setErr(res.msg);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        aria-label="Donor offer status"
        className="cursor-pointer border border-hairline bg-transparent px-2 py-1.5 font-mono text-[0.72rem] text-ink outline-none transition-colors focus:border-ink disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {err && (
        <div className="label-mono mt-1 !text-[0.6rem] text-brg">{err}</div>
      )}
    </div>
  );
}
