"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyWaitingAction } from "@/app/admin/actions";

type Req = {
  id: string;
  email: string;
  make: string | null;
  model: string | null;
};

export default function MatchingRequests({
  productId,
  requests,
  configured,
}: {
  productId: string;
  requests: Req[];
  configured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const notify = async () => {
    setBusy(true);
    setMsg(null);
    const res = await notifyWaitingAction(productId);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setMsg(
      res.sent === 0
        ? "No one waiting right now."
        : `Sent ${res.sent} of ${res.total} notification${res.total > 1 ? "s" : ""}.`,
    );
    router.refresh();
  };

  return (
    <div className="mb-8 border border-hairline bg-cream-card p-5">
      <div className="label-mono mb-3 flex items-center gap-3 !text-[0.68rem] text-brg after:h-px after:flex-1 after:bg-hairline after:content-['']">
        Waiting in the queue — {requests.length}
      </div>

      {requests.length === 0 ? (
        <p className="max-w-[60ch] font-mono text-[0.72rem] leading-[1.5] text-ink-soft/75">
          No one is waiting for these models yet. When someone requests a part
          for a matching make + model, they appear here and you can notify them
          in one click.
        </p>
      ) : (
        <>
          <ul className="mb-4 flex flex-col">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex items-baseline justify-between gap-3 border-b border-hairline/60 py-1.5 font-mono text-[0.76rem]"
              >
                <span className="text-ink">{r.email}</span>
                <span className="text-ink-soft/80">
                  {[r.make, r.model].filter(Boolean).join(" ")}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={notify}
            disabled={busy}
            className="label-mono chamfer cursor-pointer bg-brg px-5 py-3 font-bold text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
          >
            {busy
              ? "Notifying…"
              : `Notify ${requests.length} ${requests.length === 1 ? "person" : "people"}`}
          </button>
          {!configured && (
            <p className="mt-2.5 max-w-[60ch] font-mono text-[0.68rem] leading-[1.5] text-brass">
              Resend isn&apos;t set up yet — pressing the button tells you what&apos;s
              missing; nothing is sent until RESEND_API_KEY + RESEND_FROM are set
              and the domain is verified.
            </p>
          )}
        </>
      )}

      {msg && <p className="mt-2.5 font-mono text-[0.72rem] text-brg">{msg}</p>}
    </div>
  );
}
