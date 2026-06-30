"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "@/app/admin/actions";
import type { Settings } from "@/lib/settings";
import type { ParcelSize } from "@/lib/types";

const inputCls =
  "w-full border border-hairline bg-transparent px-3 py-2 font-mono text-[0.82rem] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-ink";

const TIERS: ParcelSize[] = ["small", "medium", "large"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="label-mono mt-8 mb-4 flex items-center gap-3 !text-[0.68rem] text-brg after:h-px after:flex-1 after:bg-hairline after:content-['']">
      {children}
    </div>
  );
}

export default function SettingsEditor({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState<Settings>(settings);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const update = (next: Settings) => {
    setForm(next);
    setMsg(null);
  };

  const setZone = (zi: number, patch: Partial<Settings["shipping"]["zones"][number]>) => {
    const zones = form.shipping.zones.map((z, i) =>
      i === zi ? { ...z, ...patch } : z,
    );
    update({ ...form, shipping: { ...form.shipping, zones } });
  };

  const setRate = (zi: number, tier: ParcelSize, pounds: string) => {
    const pence = Math.round((parseFloat(pounds) || 0) * 100);
    const zones = form.shipping.zones.map((z, i) =>
      i === zi ? { ...z, rates: { ...z.rates, [tier]: pence } } : z,
    );
    update({ ...form, shipping: { ...form.shipping, zones } });
  };

  const setEstimate = (zi: number, idx: 0 | 1, value: string) => {
    const zones = form.shipping.zones.map((z, i) => {
      if (i !== zi) return z;
      const estimate: [number, number] = [...z.estimate];
      estimate[idx] = parseInt(value, 10) || 0;
      return { ...z, estimate };
    });
    update({ ...form, shipping: { ...form.shipping, zones } });
  };

  const setThreshold = (tier: ParcelSize, value: string) => {
    update({
      ...form,
      shipping: {
        ...form.shipping,
        thresholds: {
          ...form.shipping.thresholds,
          [tier]: parseInt(value, 10) || 0,
        },
      },
    });
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const res = await saveSettingsAction(form);
    setBusy(false);
    setMsg(res.ok ? "Saved." : res.error);
    if (res.ok) router.refresh();
  };

  const t = form.shipping.thresholds;

  return (
    <div className="max-w-[760px]">
      <SectionTitle>Royal Mail rates (VAT-inclusive, by zone × box)</SectionTitle>
      <div className="space-y-5">
        {form.shipping.zones.map((z, zi) => (
          <div key={z.key} className="border border-hairline/60 p-4">
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft">
                  Zone label
                </span>
                <input
                  className={inputCls}
                  value={z.label}
                  onChange={(e) => setZone(zi, { label: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft">
                  Carrier
                </span>
                <input
                  className={inputCls}
                  value={z.carrier}
                  onChange={(e) => setZone(zi, { carrier: e.target.value })}
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {TIERS.map((tier) => (
                <label key={tier} className="block">
                  <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft capitalize">
                    {tier} box £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className={inputCls}
                    value={z.rates[tier] ? z.rates[tier] / 100 : ""}
                    onChange={(e) => setRate(zi, tier, e.target.value)}
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="label-mono !text-[0.6rem] text-ink-soft">
                Delivery (business days)
              </span>
              <input
                type="number"
                className={`${inputCls} w-20`}
                value={z.estimate[0]}
                onChange={(e) => setEstimate(zi, 0, e.target.value)}
              />
              <span className="text-ink-soft">–</span>
              <input
                type="number"
                className={`${inputCls} w-20`}
                value={z.estimate[1]}
                onChange={(e) => setEstimate(zi, 1, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Packing — cart slot thresholds</SectionTitle>
      <p className="mb-3 max-w-[60ch] font-mono text-[0.72rem] leading-[1.5] text-ink-soft/75">
        The cart sums each product&apos;s slots × quantity, then picks the box:
        ≤ small → Small, ≤ medium → Medium, above → Large (and multiple Large
        boxes beyond the large value).
      </p>
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft">
            Small ≤
          </span>
          <input
            type="number"
            className={inputCls}
            value={t.small}
            onChange={(e) => setThreshold("small", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft">
            Medium ≤
          </span>
          <input
            type="number"
            className={inputCls}
            value={t.medium}
            onChange={(e) => setThreshold("medium", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft">
            Large box holds
          </span>
          <input
            type="number"
            className={inputCls}
            value={t.large}
            onChange={(e) => setThreshold("large", e.target.value)}
          />
        </label>
      </div>

      <SectionTitle>Defaults</SectionTitle>
      <label className="block max-w-[240px]">
        <span className="label-mono mb-1 block !text-[0.6rem] text-ink-soft">
          Default slots for a new part
        </span>
        <input
          type="number"
          min={1}
          className={inputCls}
          value={form.defaultSlots}
          onChange={(e) =>
            update({ ...form, defaultSlots: parseInt(e.target.value, 10) || 1 })
          }
        />
      </label>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="label-mono chamfer cursor-pointer bg-brg px-6 py-3 font-bold text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
        {msg && (
          <span className="label-mono !text-[0.7rem] text-brg">{msg}</span>
        )}
      </div>
    </div>
  );
}
