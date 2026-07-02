"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setQueueStageAction } from "@/app/admin/actions";
import { QUEUE_STAGES, STAGE_LABELS, type QueueStage } from "@/lib/queue-stages";

/* Per-row workshop stage control on /admin/queue. The chosen stage shows on
   the public board (homepage §04 + /requests) as a progress chip. */
export default function QueueStageSelect({
  requestKey,
  stage,
}: {
  requestKey: string;
  stage: QueueStage;
}) {
  const router = useRouter();
  const [value, setValue] = useState<QueueStage>(stage);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const change = (next: QueueStage) => {
    const prev = value;
    setValue(next);
    setErr(null);
    start(async () => {
      const res = await setQueueStageAction({ requestKey, stage: next });
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
        onChange={(e) => change(e.target.value as QueueStage)}
        aria-label="Workshop stage"
        className="cursor-pointer border border-hairline bg-transparent px-2 py-1.5 font-mono text-[0.72rem] text-ink outline-none transition-colors focus:border-ink disabled:opacity-60"
      >
        {QUEUE_STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABELS[s]}
          </option>
        ))}
      </select>
      {err && (
        <div className="label-mono mt-1 !text-[0.6rem] text-brg">{err}</div>
      )}
    </div>
  );
}
