"use client";

import { useMemo, useState } from "react";
import { STAGE_LABELS, type QueueBoardItem } from "@/lib/queue-stages";

/* Public, searchable view of the resurrection queue so visitors can check
   whether their part is already requested (fewer duplicates) and see demand
   (social proof). Voting/requesting still happens on the home queue, which
   requires an account. */
export default function RequestsBoard({
  items,
  voteTarget = 25,
}: {
  items: QueueBoardItem[];
  voteTarget?: number;
}) {
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(ql) ||
        (it.vehicle ?? "").toLowerCase().includes(ql),
    );
  }, [items, q]);

  return (
    <>
      <div className="mb-6 flex w-full max-w-[520px] border border-hairline transition-colors focus-within:border-ink">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a part or vehicle…"
          aria-label="Search the queue"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-[0.82rem] text-ink outline-none placeholder:text-ink-soft/65"
        />
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
          The queue is just getting started.{" "}
          <a href="/#queue" className="text-brg hover:underline">
            Be the first to request a part →
          </a>
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-ink-soft/65 px-6 py-10 text-center text-ink-soft">
          Nothing matches &ldquo;{q}&rdquo; yet —{" "}
          <a href="/#queue" className="text-brg hover:underline">
            add it to the queue →
          </a>
        </div>
      ) : (
        <ul className="border-t border-hairline">
          {visible.map((it, i) => (
            <li key={it.key} className="border-b border-hairline py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-num text-[1.1rem] text-ink-soft/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="text-[1rem]">
                      {it.label}
                      {it.stage !== "queued" && (
                        <span className="ml-2.5 inline-block translate-y-[-1px] border border-brg px-[7px] py-0.5 font-mono text-[0.6rem] tracking-[0.12em] text-brg">
                          {STAGE_LABELS[it.stage].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {it.vehicle && (
                      <div className="label-mono !text-[0.62rem] text-ink-soft">
                        {it.vehicle}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-num text-[1.2rem] text-brg">{it.count}</span>
                  <span className="label-mono !text-[0.58rem] text-ink-soft">
                    {it.stage !== "queued"
                      ? it.count === 1
                        ? "backer"
                        : "backers"
                      : `/ ${voteTarget} votes`}
                  </span>
                </div>
              </div>
              {it.stage === "queued" && (
                <div className="mt-2.5 ml-[38px] h-[3px] bg-ink-soft/15">
                  <div
                    className="h-full bg-brg"
                    style={{
                      width: `${Math.min(100, Math.round((it.count / Math.max(1, voteTarget)) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
