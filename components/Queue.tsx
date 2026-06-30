"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Reveal, { EASE } from "./Reveal";
import SectionNo from "./SectionNo";
import GhostNumeral from "./GhostNumeral";
import { VEHICLES, modelsForMake } from "@/lib/vehicles";
import { requestPart, votePart, donatePart } from "@/lib/queue-actions";
import type { QueueBoardItem } from "@/lib/queue";

// native <option> list themed dark to match the band
const OPT = { background: "#23272b", color: "#ecedee" };
const CONDITIONS = [
  "Mint / complete",
  "Good, usable",
  "Cracked / broken",
  "Incomplete / spares",
];

const fieldCls =
  "w-full border border-cream/40 bg-transparent px-4 py-[15px] font-mono text-[0.82rem] tracking-[0.06em] text-cream outline-none transition-colors placeholder:text-cream/55 focus:border-cream/80";

function VehicleSelects({
  make,
  model,
  setMake,
  setModel,
}: {
  make: string;
  model: string;
  setMake: (v: string) => void;
  setModel: (v: string) => void;
}) {
  return (
    <div className="mb-2.5 grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
      <div className="relative">
        <select
          required
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
          }}
          aria-label="Vehicle make"
          className={`${fieldCls} cursor-pointer appearance-none pr-9`}
          style={{ color: make ? undefined : "rgba(234,236,233,0.55)" }}
        >
          <option value="" style={OPT}>
            Make…
          </option>
          {VEHICLES.map((v) => (
            <option key={v.make} value={v.make} style={OPT}>
              {v.make}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-cream/55"
        >
          ▾
        </span>
      </div>
      <div className="relative">
        <select
          required
          value={model}
          disabled={!make}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Vehicle model"
          className={`${fieldCls} cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed disabled:opacity-45`}
          style={{ color: model ? undefined : "rgba(234,236,233,0.55)" }}
        >
          <option value="" style={OPT}>
            {make ? "Model…" : "Pick a make first"}
          </option>
          {modelsForMake(make).map((m) => (
            <option key={m} value={m} style={OPT}>
              {m}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-cream/55"
        >
          ▾
        </span>
      </div>
    </div>
  );
}

type FormState = "idle" | "sending" | "ok" | "error";

function StatusLine({ state, note }: { state: FormState; note: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state + note}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={`label-mono mt-3.5 !text-[0.68rem] !tracking-[0.1em] ${
          state === "ok"
            ? "text-gold"
            : state === "error"
              ? "text-brg"
              : "text-cream/60"
        }`}
      >
        {note}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- request a new part ---------- */
function RequestForm({ prefill }: { prefill: string }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [part, setPart] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (prefill) {
      setPart(prefill);
      setState("idle");
    }
  }, [prefill]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    start(async () => {
      const res = await requestPart({ make, model, part });
      setState(res.ok ? "ok" : "error");
      if (res.ok && !res.already) setPart("");
    });
  };

  const note = {
    idle: "We revive a part once enough owners ask for the same one.",
    sending: "Adding it to the ledger…",
    ok: "Logged. We'll write to you the day it's revived.",
    error: "Something broke — try again in a moment.",
  }[state];

  return (
    <form onSubmit={submit} className="max-w-[460px]">
      <VehicleSelects
        make={make}
        model={model}
        setMake={setMake}
        setModel={setModel}
      />
      <div className="flex border border-cream/40 transition-colors focus-within:border-cream/80">
        <input
          type="text"
          required
          value={part}
          onChange={(e) => setPart(e.target.value)}
          placeholder="Part name or original ref. no."
          aria-label="Part name or original reference number"
          className="min-w-0 flex-1 bg-transparent px-4 py-[15px] font-mono text-[0.82rem] tracking-[0.06em] text-cream outline-none placeholder:text-cream/55"
        />
        <button
          type="submit"
          disabled={pending}
          className="label-mono cursor-pointer border-none bg-cream px-[22px] text-ink transition-colors hover:bg-white disabled:opacity-60"
        >
          {pending ? "…" : "Request"}
        </button>
      </div>
      <StatusLine state={state} note={note} />
    </form>
  );
}

/* ---------- donor / exchange programme ---------- */
function DonorForm() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [part, setPart] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    start(async () => {
      const res = await donatePart({ make, model, part, condition, notes });
      setState(res.ok ? "ok" : "error");
      if (res.ok) {
        setPart("");
        setNotes("");
        setCondition("");
      }
    });
  };

  const note = {
    idle: "No commitment yet — we'll reply with return postage details.",
    sending: "Sending your offer…",
    ok: "Got it. We'll be in touch about shipping the original to us.",
    error: "Something broke — try again in a moment.",
  }[state];

  return (
    <form onSubmit={submit} className="max-w-[460px]">
      <div className="mb-4 border-l-2 border-gold/70 pl-3.5 text-[0.92rem] text-cream/80">
        Send us the original. We 3D-scan and inspect it, then return{" "}
        <em className="text-gold not-italic">your part</em> to you — plus a free
        printed copy. You help revive it for the next owner.
      </div>
      <VehicleSelects
        make={make}
        model={model}
        setMake={setMake}
        setModel={setModel}
      />
      <input
        type="text"
        required
        value={part}
        onChange={(e) => setPart(e.target.value)}
        placeholder="Which part? Name or original ref. no."
        aria-label="Part name or original reference number"
        className={`${fieldCls} mb-2.5`}
      />
      <div className="relative mb-2.5">
        <select
          required
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          aria-label="Condition of the part"
          className={`${fieldCls} cursor-pointer appearance-none pr-9`}
          style={{ color: condition ? undefined : "rgba(234,236,233,0.55)" }}
        >
          <option value="" style={OPT}>
            Condition…
          </option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c} style={OPT}>
              {c}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-cream/55"
        >
          ▾
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything else? (colour, year, quantity…)"
        aria-label="Notes"
        rows={2}
        className={`${fieldCls} mb-2.5 resize-none`}
      />
      <button
        type="submit"
        disabled={pending}
        className="label-mono cursor-pointer border-none bg-gold px-[22px] py-[14px] text-ink transition-colors hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Offer my original"}
      </button>
      <StatusLine state={state} note={note} />
    </form>
  );
}

/* ---------- board row with vote control ---------- */
function BoardRow({
  item,
  index,
  isAuthed,
  voted,
  onVoted,
}: {
  item: QueueBoardItem;
  index: number;
  isAuthed: boolean;
  voted: boolean;
  onVoted: (key: string) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [localVoted, setLocalVoted] = useState(voted);
  const [count, setCount] = useState(item.count);

  const vote = () => {
    if (!isAuthed) {
      router.push("/account/login");
      return;
    }
    if (localVoted || pending) return;
    setLocalVoted(true);
    setCount((c) => c + 1);
    start(async () => {
      const [make, model] = (item.vehicle ?? "").split(" · ");
      const res = await votePart({
        key: item.key,
        label: item.label,
        make,
        model,
      });
      if (!res.ok) {
        setLocalVoted(false);
        setCount((c) => c - 1);
      } else {
        onVoted(item.key);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: EASE }}
      className="border-b border-hairline-dark"
    >
      <div className="flex items-baseline gap-3 px-0.5 py-[15px]">
        <div className="min-w-0">
          <div className="font-display text-[1rem] font-bold">
            {item.label}
            {index === 0 && count > 0 && (
              <span className="ml-2.5 inline-block translate-y-[-2px] bg-gold px-[7px] py-0.5 font-mono text-[0.62rem] tracking-[0.12em] text-ink">
                MOST WANTED
              </span>
            )}
          </div>
          {item.vehicle && (
            <div className="label-mono !text-[0.68rem] !tracking-[0.1em] text-cream/75">
              {item.vehicle}
            </div>
          )}
        </div>
        <span
          aria-hidden
          className="flex-1 border-b border-dotted border-cream/30"
        />
        <div className="flex shrink-0 items-baseline gap-3 whitespace-nowrap">
          <span className="font-mono text-[0.74rem] tracking-[0.1em] text-gold">
            {count} waiting
          </span>
          <button
            type="button"
            onClick={vote}
            disabled={localVoted || pending}
            className={`label-mono cursor-pointer border px-2.5 py-1 !text-[0.62rem] transition-colors ${
              localVoted
                ? "border-gold/40 text-gold/70"
                : "border-cream/40 text-cream hover:border-cream hover:bg-cream hover:text-ink"
            } disabled:cursor-default`}
          >
            {localVoted ? "Voted ✓" : "Vote"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- section ---------- */
export default function Queue({
  board,
  isAuthed,
  votedKeys,
}: {
  board: QueueBoardItem[];
  isAuthed: boolean;
  votedKeys: string[];
}) {
  const [tab, setTab] = useState<"request" | "donor">("request");
  const [prefill, setPrefill] = useState("");
  const voted = useRef(new Set(votedKeys));

  useEffect(() => {
    const onPrefill = (e: Event) => {
      setPrefill((e as CustomEvent<string>).detail);
      setTab("request");
    };
    window.addEventListener("evocation:prefill-queue", onPrefill);
    return () =>
      window.removeEventListener("evocation:prefill-queue", onPrefill);
  }, []);

  return (
    <section
      id="queue"
      className="relative overflow-hidden bg-brg-deep py-[clamp(76px,11vh,140px)] text-cream"
    >
      <div className="wrap relative">
        <GhostNumeral n="04" dark />
        <SectionNo dark>§ 04 — The Resurrection Queue</SectionNo>
        <div className="grid grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] min-[981px]:grid-cols-2">
          <div>
            <Reveal
              as="h2"
              className="font-display max-w-[20ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]"
            >
              Your part is gone?{" "}
              <em className="text-gold not-italic">Put it in the queue.</em>
            </Reveal>
            <Reveal
              as="p"
              delay={0.1}
              className="my-5 mb-[26px] max-w-[44ch] text-cream/75"
            >
              Request the part that&apos;s keeping your car incomplete, vote for
              the ones already listed, or lend us an original to revive it
              faster.
            </Reveal>

            <Reveal delay={0.2}>
              {isAuthed ? (
                <>
                  <div className="mb-5 inline-flex border border-cream/30">
                    {(
                      [
                        ["request", "Request a part"],
                        ["donor", "I have the original"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`label-mono cursor-pointer px-3.5 py-2 !text-[0.64rem] transition-colors ${
                          tab === key
                            ? "bg-cream text-ink"
                            : "text-cream/70 hover:text-cream"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {tab === "request" ? (
                    <RequestForm prefill={prefill} />
                  ) : (
                    <DonorForm />
                  )}
                </>
              ) : (
                <div className="max-w-[460px] border border-cream/25 p-6">
                  <div className="font-display text-[1.15rem] font-bold">
                    Requesting, voting &amp; donating need an account.
                  </div>
                  <p className="mt-2 mb-5 text-[0.95rem] text-cream/75">
                    Free to join — it&apos;s how we notify you the day your part
                    is revived, and how we keep the vote honest (one per owner).
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/account/login"
                      className="label-mono cursor-pointer bg-cream px-[22px] py-[13px] text-ink transition-colors hover:bg-white"
                    >
                      Sign in
                    </a>
                    <a
                      href="/account/login"
                      className="label-mono cursor-pointer border border-cream/40 px-[22px] py-[13px] text-cream transition-colors hover:border-cream"
                    >
                      Create account
                    </a>
                  </div>
                </div>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            {board.length === 0 ? (
              <div className="border border-dashed border-cream/30 px-6 py-12 text-center text-cream/70">
                No parts in the queue yet.
                <br />
                Be the first to put one in.
              </div>
            ) : (
              <div className="border-t border-hairline-dark">
                {board.map((item, i) => (
                  <BoardRow
                    key={item.key}
                    item={item}
                    index={i}
                    isAuthed={isAuthed}
                    voted={voted.current.has(item.key)}
                    onVoted={(k) => voted.current.add(k)}
                  />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
