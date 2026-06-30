"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { saveProfileAction, deleteAccountAction } from "@/app/account/actions";

export type ProfileInitial = {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  address_country: string;
  marketing_opt_in: boolean;
};

// common shipping destinations (ISO-2). "Other" countries can be typed at
// checkout — this just covers the bulk for prefill.
const COUNTRIES: [string, string][] = [
  ["GB", "United Kingdom"],
  ["IE", "Ireland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["NL", "Netherlands"],
  ["BE", "Belgium"],
  ["ES", "Spain"],
  ["IT", "Italy"],
  ["PT", "Portugal"],
  ["CH", "Switzerland"],
  ["AT", "Austria"],
  ["DK", "Denmark"],
  ["SE", "Sweden"],
  ["NO", "Norway"],
  ["FI", "Finland"],
  ["PL", "Poland"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["NZ", "New Zealand"],
  ["JP", "Japan"],
];

const field =
  "w-full border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.04em] text-ink outline-none transition-colors placeholder:text-ink-soft/65 focus:border-ink";
const labelCls = "label-mono !text-[0.6rem] text-ink-soft";

function Msg({ m }: { m: { text: string; ok: boolean } | null }) {
  if (!m) return null;
  return (
    <div
      className={`label-mono mt-3 !text-[0.66rem] ${m.ok ? "text-brass" : "text-brg"}`}
    >
      {m.text}
    </div>
  );
}

export default function ProfileForm({
  initial,
  email,
}: {
  initial: ProfileInitial;
  email: string;
}) {
  const router = useRouter();
  const [p, setP] = useState<ProfileInitial>(initial);
  const [savedMsg, setSavedMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, start] = useTransition();

  const set = (k: keyof ProfileInitial, v: string | boolean) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(null);
    start(async () => {
      const r = await saveProfileAction(p);
      setSavedMsg(
        r.ok
          ? { text: "Saved — used to prefill your checkout.", ok: true }
          : { text: r.error ?? "Couldn't save.", ok: false },
      );
    });
  };

  /* --- password --- */
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw !== pw2) return setPwMsg({ text: "Passwords don't match.", ok: false });
    setPwBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) return setPwMsg({ text: error.message, ok: false });
    setPw("");
    setPw2("");
    setPwMsg({ text: "Password updated.", ok: true });
  };

  /* --- delete --- */
  const [delBusy, setDelBusy] = useState(false);
  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Delete your account permanently? Your order history is kept for our records but unlinked from you. This can't be undone.",
      )
    )
      return;
    setDelBusy(true);
    const r = await deleteAccountAction();
    if (!r.ok) {
      setDelBusy(false);
      alert(r.error ?? "Couldn't delete the account.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mt-8 space-y-12">
      {/* details + address */}
      <form onSubmit={save}>
        <h2 className="font-display text-[1.15rem] font-bold">
          Details &amp; shipping address
        </h2>
        <p className="mt-1 mb-5 text-[0.9rem] text-ink-soft">
          Saved to prefill checkout. You can always edit it on the payment page.
        </p>

        <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Full name</span>
            <input
              className={field}
              value={p.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Jane Smith"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Phone (for delivery)</span>
            <input
              className={field}
              value={p.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+44 …"
            />
          </label>
          <label className="flex flex-col gap-1 min-[560px]:col-span-2">
            <span className={labelCls}>Address line 1</span>
            <input
              className={field}
              value={p.address_line1}
              onChange={(e) => set("address_line1", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 min-[560px]:col-span-2">
            <span className={labelCls}>Address line 2</span>
            <input
              className={field}
              value={p.address_line2}
              onChange={(e) => set("address_line2", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>City</span>
            <input
              className={field}
              value={p.address_city}
              onChange={(e) => set("address_city", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>County / State</span>
            <input
              className={field}
              value={p.address_state}
              onChange={(e) => set("address_state", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Postcode</span>
            <input
              className={field}
              value={p.address_postal_code}
              onChange={(e) => set("address_postal_code", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Country</span>
            <select
              className={`${field} cursor-pointer`}
              value={p.address_country}
              onChange={(e) => set("address_country", e.target.value)}
            >
              <option value="">Country…</option>
              {COUNTRIES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[0.9rem]">
          <input
            type="checkbox"
            checked={p.marketing_opt_in}
            onChange={(e) => set("marketing_opt_in", e.target.checked)}
            className="h-4 w-4 accent-[var(--brg)]"
          />
          Email me about new revivals and parts I&apos;ve voted for.
        </label>

        <button
          type="submit"
          disabled={pending}
          className="label-mono mt-5 cursor-pointer border border-transparent bg-brg px-6 py-3 text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        <Msg m={savedMsg} />
      </form>

      {/* password */}
      <form onSubmit={changePassword} className="border-t border-hairline pt-10">
        <h2 className="font-display text-[1.15rem] font-bold">Password</h2>
        <p className="mt-1 mb-5 text-[0.9rem] text-ink-soft">
          Signed in as {email}.
        </p>
        <div className="grid max-w-[460px] grid-cols-1 gap-3 min-[440px]:grid-cols-2">
          <input
            type="password"
            minLength={8}
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="new password"
            className={field}
          />
          <input
            type="password"
            minLength={8}
            required
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="confirm"
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={pwBusy}
          className="label-mono mt-4 cursor-pointer border border-ink px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-60"
        >
          {pwBusy ? "…" : "Update password"}
        </button>
        <Msg m={pwMsg} />
      </form>

      {/* danger zone */}
      <div className="border-t border-hairline pt-10">
        <h2 className="font-display text-[1.15rem] font-bold">Delete account</h2>
        <p className="mt-1 mb-5 max-w-[52ch] text-[0.9rem] text-ink-soft">
          Removes your account and saved details. Past orders are kept for our
          records (legal/accounting) but unlinked from you.
        </p>
        <button
          type="button"
          onClick={deleteAccount}
          disabled={delBusy}
          className="label-mono cursor-pointer border border-brg px-6 py-3 text-brg transition-colors hover:bg-brg hover:text-cream disabled:opacity-60"
        >
          {delBusy ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
