"use client";

import { useState } from "react";
import { subscribeNewsletterAction } from "@/app/actions/newsletter";

/* Footer email capture for visitors who aren't buying today — the only general
   marketing opt-in on the site (the queue/NotifyMe are per-part). */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    const r = await subscribeNewsletterAction(email, "footer");
    setMsg(r.msg);
    if (r.ok) {
      setState("done");
      setEmail("");
    } else {
      setState("error");
    }
  };

  return (
    <div>
      <h4 className="label-mono mb-4 !text-[0.7rem] !tracking-[0.16em] text-ink-soft">
        New revivals
      </h4>
      {state === "done" ? (
        <p className="text-[0.85rem] text-brass">{msg}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <p className="text-[0.82rem] text-ink-soft">
            Get an email when we bring back a part.
          </p>
          <div className="flex items-stretch border border-hairline transition-colors focus-within:border-ink">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              aria-label="Email for new revival updates"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[0.78rem] text-ink outline-none placeholder:text-ink-soft/65"
            />
            <button
              type="submit"
              disabled={state === "busy"}
              className="label-mono px-3 !text-[0.62rem] text-brg transition-colors hover:text-brg-deep disabled:opacity-60"
            >
              {state === "busy" ? "…" : "Join →"}
            </button>
          </div>
          {state === "error" && msg && (
            <p className="label-mono !text-[0.62rem] text-brg">{msg}</p>
          )}
        </form>
      )}
    </div>
  );
}
