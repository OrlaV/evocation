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
    const parts: string[] = [];
    if (res.total) parts.push(`${res.sent}/${res.total} from the queue`);
    if (res.garageSent) parts.push(`${res.garageSent} garage owner${res.garageSent > 1 ? "s" : ""}`);
    setMsg(parts.length ? `Notified ${parts.join(" + ")}.` : "No one waiting right now.");
    router.refresh();
  };

  return (
    <div className="mb-8 border border-hairline bg-cream-card p-5">
      <div className="label-mono mb-3 flex items-center gap-3 !text-[0.68rem] text-brg after:h-px after:flex-1 after:bg-hairline after:content-['']">
        Waiting in the queue — {requests.length}
      </div>

      {requests.length > 0 && (
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
      )}
      <p className="mb-3 max-w-[60ch] font-mono text-[0.72rem] leading-[1.5] text-ink-soft/75">
        Emails everyone waiting for a matching make + model — queue requesters
        {" "}plus garage owners who opted in — and marks the queue rows notified.
      </p>
      <button
        type="button"
        onClick={notify}
        disabled={busy}
        className="label-mono chamfer cursor-pointer bg-brg px-5 py-3 font-bold text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
      >
        {busy ? "Notifying…" : "Notify interested owners"}
      </button>
      {!configured && (
        <p className="mt-2.5 max-w-[60ch] font-mono text-[0.68rem] leading-[1.5] text-brass">
          Resend isn&apos;t set up yet — pressing the button tells you what&apos;s
          missing; nothing is sent until RESEND_API_KEY + RESEND_FROM are set and
          the domain is verified.
        </p>
      )}

      {msg && <p className="mt-2.5 font-mono text-[0.72rem] text-brg">{msg}</p>}
    </div>
  );
}
