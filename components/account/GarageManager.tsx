"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MAKES, modelsForMake } from "@/lib/vehicles";
import {
  addGarageVehicleAction,
  removeGarageVehicleAction,
} from "@/app/account/actions";

export type GarageVehicle = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  hand: string | null;
};

const field =
  "border border-hairline bg-transparent px-3 py-2.5 font-mono text-[0.8rem] text-ink outline-none transition-colors focus:border-ink";

export default function GarageManager({ initial }: { initial: GarageVehicle[] }) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [hand, setHand] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, start] = useTransition();

  const models = useMemo(() => (make ? modelsForMake(make) : []), [make]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await addGarageVehicleAction({ make, model, year, hand });
      if (r.ok) {
        setMake("");
        setModel("");
        setYear("");
        setHand("");
        router.refresh();
      } else {
        setMsg({ text: r.error ?? "Couldn't add it.", ok: false });
      }
    });
  };

  const remove = (id: string) =>
    start(async () => {
      await removeGarageVehicleAction(id);
      router.refresh();
    });

  return (
    <div className="border-t border-hairline pt-10">
      <h2 className="font-display text-[1.15rem] font-bold">Your garage</h2>
      <p className="mt-1 mb-5 max-w-[54ch] text-[0.9rem] text-ink-soft">
        Add your cars and we&apos;ll flag the parts that fit them — on the shop
        and each product page.
      </p>

      {initial.length > 0 && (
        <ul className="mb-6 border-t border-hairline">
          {initial.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between gap-3 border-b border-hairline py-3"
            >
              <span>
                <span className="text-[0.98rem]">
                  {v.make} {v.model}
                </span>
                <span className="label-mono ml-2 !text-[0.6rem] text-ink-soft">
                  {[v.year, v.hand].filter(Boolean).join(" · ")}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(v.id)}
                disabled={pending}
                className="label-mono cursor-pointer !text-[0.64rem] text-ink-soft transition-colors hover:text-brg disabled:opacity-60"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="flex flex-wrap items-end gap-2">
        <select
          aria-label="Make"
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
          }}
          className={`${field} cursor-pointer`}
        >
          <option value="">Make…</option>
          {MAKES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={!make}
          className={`${field} cursor-pointer disabled:opacity-50`}
        >
          <option value="">Model…</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          aria-label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          inputMode="numeric"
          className={`${field} w-20`}
        />
        <select
          aria-label="Hand of drive"
          value={hand}
          onChange={(e) => setHand(e.target.value)}
          className={`${field} cursor-pointer`}
        >
          <option value="">LHD/RHD</option>
          <option value="LHD">LHD</option>
          <option value="RHD">RHD</option>
        </select>
        <button
          type="submit"
          disabled={pending || !make || !model}
          className="label-mono cursor-pointer border border-ink px-5 py-2.5 text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-50"
        >
          {pending ? "…" : "Add car"}
        </button>
      </form>
      {msg && (
        <div className="label-mono mt-3 !text-[0.66rem] text-brg">{msg.text}</div>
      )}
    </div>
  );
}
