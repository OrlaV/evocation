"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPromoCodeAction,
  setPromoActiveAction,
} from "@/app/admin/actions";

const inputCls =
  "w-full border border-hairline bg-transparent px-3 py-2 font-mono text-[0.82rem] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-ink";

const labelCls = "label-mono mb-1 block !text-[0.6rem] text-ink-soft";

/* Create form for a new promo code. The code becomes usable immediately in
   the promo-code field Stripe Checkout already shows. */
export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [minimum, setMinimum] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await createPromoCodeAction({
        code,
        kind,
        value: parseFloat(value) || 0,
        maxRedemptions: parseInt(maxRedemptions, 10) || undefined,
        expiresAt: expiresAt || undefined,
        minimumPounds: parseFloat(minimum) || undefined,
      });
      setOk(res.ok);
      setMsg(res.ok ? res.msg : res.error);
      if (res.ok) {
        setCode("");
        setValue("");
        setMaxRedemptions("");
        setExpiresAt("");
        setMinimum("");
        router.refresh();
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="mt-8 max-w-[760px] border border-hairline/60 p-4"
    >
      <div className="label-mono mb-4 flex items-center gap-3 !text-[0.68rem] text-brg after:h-px after:flex-1 after:bg-hairline after:content-['']">
        New promo code
      </div>
      <div className="grid grid-cols-2 gap-3 min-[720px]:grid-cols-3">
        <label className="block">
          <span className={labelCls}>Code</span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CLUB10"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "percent" | "amount")}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="percent">% off</option>
            <option value="amount">£ off</option>
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>{kind === "percent" ? "Percent" : "Pounds"}</span>
          <input
            required
            type="number"
            step={kind === "percent" ? "1" : "0.01"}
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={kind === "percent" ? "10" : "5.00"}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Max uses (blank = unlimited)</span>
          <input
            type="number"
            min="1"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Expires (blank = never)</span>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Min. order £ (blank = none)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minimum}
            onChange={(e) => setMinimum(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="label-mono chamfer cursor-pointer bg-brg px-6 py-3 font-bold text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create code"}
        </button>
        {msg && (
          <span
            className={`label-mono !text-[0.7rem] ${ok ? "text-gold" : "text-brg"}`}
          >
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}

/* Row-level activate/deactivate toggle. */
export function PromoToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const toggle = () => {
    setErr(null);
    start(async () => {
      const res = await setPromoActiveAction({ id, active: !active });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`label-mono cursor-pointer border px-2.5 py-1 !text-[0.62rem] transition-colors disabled:opacity-60 ${
          active
            ? "border-ink-soft/50 text-ink-soft hover:border-brg hover:text-brg"
            : "border-gold text-gold hover:border-ink hover:text-ink"
        }`}
      >
        {pending ? "…" : active ? "Deactivate" : "Reactivate"}
      </button>
      {err && (
        <div className="label-mono mt-1 !text-[0.6rem] text-brg">{err}</div>
      )}
    </div>
  );
}
