"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeRef } from "@/lib/types";

/* Search box of the reference registry: any part number → its status page.
   Pure navigation — /ref/[ref] resolves the status server-side. */
export default function RefLookup() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = normalizeRef(q);
    if (ref.length < 3) {
      setErr("Enter at least 3 characters of the part number.");
      return;
    }
    setErr(null);
    setBusy(true);
    router.push(`/ref/${ref}`);
  };

  return (
    <form onSubmit={submit} className="max-w-[520px]">
      <div className="flex border border-hairline transition-colors focus-within:border-ink">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Original part number, e.g. MXC1306…"
          aria-label="Look up an original part number"
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-mono text-[0.85rem] text-ink outline-none placeholder:text-ink-soft/65"
        />
        <button
          type="submit"
          disabled={busy}
          className="label-mono cursor-pointer border-none bg-brg px-[22px] text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {busy ? "…" : "Check"}
        </button>
      </div>
      {err && (
        <p className="label-mono mt-2 !text-[0.64rem] text-brg">{err}</p>
      )}
    </form>
  );
}
