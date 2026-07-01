"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { passwordError, PASSWORD_HINT, PASSWORD_MIN } from "@/lib/password";

/* Reached from the password-recovery email (via /auth/callback, which sets a
   recovery session). The user sets a new password here. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const weak = passwordError(password);
    if (weak) {
      setError(weak);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(
        /session|auth/i.test(error.message)
          ? "This reset link has expired — request a new one."
          : error.message,
      );
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <div className="w-full max-w-[420px] border border-hairline bg-cream-card p-[6px]">
        <div className="border border-hairline px-7 py-9">
          <div className="label-mono !tracking-[0.18em] text-brg">
            Your garage
          </div>
          <h1 className="font-display mt-2 text-[1.5rem] font-bold">
            Set a new password
          </h1>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <input
              type="password"
              required
              minLength={PASSWORD_MIN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`new password — ${PASSWORD_HINT.toLowerCase()}`}
              className="border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none transition-colors placeholder:text-ink-soft/65 focus:border-ink"
            />
            <input
              type="password"
              required
              minLength={PASSWORD_MIN}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="confirm new password"
              className="border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none transition-colors placeholder:text-ink-soft/65 focus:border-ink"
            />
            <button
              type="submit"
              disabled={busy}
              className="label-mono mt-2 cursor-pointer border border-transparent bg-brg px-6 py-3.5 text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
            >
              {busy ? "…" : "Update password"}
            </button>
            {error && (
              <div className="label-mono !text-[0.68rem] !tracking-[0.08em] text-brg">
                {error}
              </div>
            )}
          </form>
          <a
            href="/account/login"
            className="label-mono mt-6 inline-block !text-[0.68rem] text-ink-soft transition-colors hover:text-brg"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    </main>
  );
}
