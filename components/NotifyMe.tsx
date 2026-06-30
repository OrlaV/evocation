"use client";

import { useState } from "react";

type State = "idle" | "form" | "sending" | "ok" | "error";

/* Interim product CTA until Stripe Checkout lands — turns order intent
   into a queue_requests row instead of a dead button. */
export default function NotifyMe({ partLabel }: { partLabel: string }) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: partLabel, email, company }),
      });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "ok") {
    return (
      <div className="label-mono mt-5 border border-brg px-5 py-4 !text-[0.72rem] !tracking-[0.1em] text-brg">
        You&apos;re on the list — first to know when ordering opens.
      </div>
    );
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("form")}
        className="label-mono chamfer mt-5 w-full cursor-pointer bg-brg px-[26px] py-4 font-bold text-cream transition-colors duration-200 hover:bg-brg-deep"
      >
        Get notified when ordering opens
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5">
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="flex border border-ink/40 transition-colors focus-within:border-ink">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Your email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-[15px] font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none placeholder:text-ink-soft/65"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="label-mono cursor-pointer border-none bg-brg px-[22px] text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {state === "sending" ? "…" : "Notify me"}
        </button>
      </div>
      <div
        className={`label-mono mt-2.5 !text-[0.66rem] !tracking-[0.1em] ${
          state === "error" ? "text-brg" : "text-ink-soft/80"
        }`}
      >
        {state === "error"
          ? "Something broke — try again, or email us."
          : "One email when ordering opens. Nothing else."}
      </div>
    </form>
  );
}
