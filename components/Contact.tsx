"use client";

import { useState } from "react";
import { submitContactAction } from "@/app/actions/contact";
import { CONTACT_TOPICS } from "@/lib/contact-topics";
import Reveal from "./Reveal";
import GhostNumeral from "./GhostNumeral";

const inputCls =
  "w-full border border-ink-soft/40 bg-cream px-3 py-2.5 font-mono text-[0.82rem] text-ink outline-none transition-colors placeholder:text-ink-soft/55 focus:border-ink";

const labelCls =
  "label-mono mb-1.5 block !text-[0.62rem] !tracking-[0.14em] text-ink-soft";

/* Bare contact form — shared by the homepage section below and /contact. */
export function ContactForm({ className = "" }: { className?: string }) {
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    const r = await submitContactAction({ topic, name, email, message, company });
    setMsg(r.msg);
    setState(r.ok ? "done" : "error");
  };

  // certificate treatment (double rule on a raised card) — same family as the
  // Guarantee panel, so the form reads as a solid object, not floating fields.
  return (
    <div className={`border border-hairline bg-cream-card p-[6px] ${className}`}>
      <div className="border border-hairline px-[clamp(16px,2.5vw,28px)] py-[clamp(20px,3vh,30px)]">
        {state === "done" ? (
          <div>
            <span className="label-mono block !tracking-[0.18em] text-brg">
              Message sent
            </span>
            <p className="mt-3 text-[0.95rem] text-ink-soft">{msg}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* honeypot — invisible to humans, tempting to bots */}
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
            <div>
              <label htmlFor="contact-topic" className={labelCls}>
                What&apos;s it about?
              </label>
              {/* native select, restyled to sit with the inputs; the chevron is
                  drawn by us because appearance-none removes the platform one */}
              <div className="relative">
                <select
                  id="contact-topic"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`${inputCls} appearance-none pr-9 ${topic ? "" : "text-ink-soft/55"}`}
                >
                  {/* options carry their own colors — the dimmed placeholder
                      color on the <select> would otherwise bleed into the
                      native dropdown list (Windows renders options with the
                      select's inherited color) */}
                  <option value="" disabled className="text-ink-soft">
                    Choose a topic…
                  </option>
                  {CONTACT_TOPICS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-cream text-ink">
                      {t.label}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[0.7rem] text-ink-soft"
                >
                  ▾
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelCls}>
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className={labelCls}>
                Message
              </label>
              <textarea
                id="contact-message"
                required
                minLength={10}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="your car, the part, the question…"
                className={`${inputCls} resize-y`}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={state === "busy"}
                className="label-mono bg-brg px-6 py-3 !text-[0.66rem] !tracking-[0.14em] text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
              >
                {state === "busy" ? "Sending…" : "Send message →"}
              </button>
              {state === "error" && msg && (
                <p className="label-mono !text-[0.62rem] text-brg">{msg}</p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* Homepage §06 — last stop before the footer: a real way to reach a human,
   for the visitor who scrolled the whole story and still has a question. */
export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-hairline py-[clamp(76px,11vh,140px)]"
    >
      <div className="wrap relative">
        <GhostNumeral n="06" />
        <div className="grid gap-x-14 gap-y-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Reveal>
            <span className="label-mono block !tracking-[0.18em] text-brg">
              Get in touch
            </span>
            <h2 className="font-display mt-5 max-w-[16ch] text-[clamp(1.8rem,3.8vw,2.9rem)] leading-[1.12] font-bold tracking-[-0.015em]">
              A question before you order?
            </h2>
            <p className="mt-5 max-w-[46ch] text-ink-soft">
              Fitment doubts, a part you can&apos;t find, an order to chase —
              write to us. Real people, in the UK, usually within one working
              day.
            </p>
            <a
              href="mailto:contact@evocation.store"
              className="label-mono mt-6 inline-block !text-[0.7rem] !tracking-[0.14em] text-brg hover:underline"
            >
              contact@evocation.store
            </a>
          </Reveal>
          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
