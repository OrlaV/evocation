"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { passwordError, PASSWORD_HINT, PASSWORD_MIN } from "@/lib/password";

type Mode = "signin" | "signup" | "forgot";

export default function AccountLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // a failed/expired email link bounces here with ?err=link. Read after mount
  // (client-only URL) to avoid a hydration mismatch — setState here is intended.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("err") === "link") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("That link didn't work or expired — try again.");
    }
  }, []);

  const callback = (next: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const reset = () => {
    setError(null);
    setNotice(null);
    setNeedsConfirm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callback("/account/reset"),
      });
      setBusy(false);
      if (error) return setError(error.message);
      return setNotice("Check your inbox for a link to reset your password.");
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        // an unconfirmed account is the one case we must surface (to offer a
        // resend); every other failure stays generic so we don't reveal
        // whether an account exists.
        if (/confirm/i.test(error.message)) {
          setNeedsConfirm(true);
          return setError("Please confirm your email first — we can resend it.");
        }
        return setError("Wrong email or password.");
      }
      router.push("/account");
      router.refresh();
      return;
    }

    // signup
    const weak = passwordError(password);
    if (weak) {
      setBusy(false);
      return setError(weak);
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callback("/account") },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.push("/account");
      router.refresh();
      return;
    }
    setNotice("Account created — check your inbox to confirm your email.");
    setMode("signin");
  };

  const resendConfirmation = async () => {
    reset();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: callback("/account") },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice("Confirmation email sent — check your inbox.");
  };

  const title =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
        ? "Create your account"
        : "Reset your password";

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <div className="w-full max-w-[420px] border border-hairline bg-cream-card p-[6px]">
        <div className="border border-hairline px-7 py-9">
          <div className="label-mono !tracking-[0.18em] text-brg">
            Your garage
          </div>
          <h1 className="font-display mt-2 text-[1.5rem] font-bold">{title}</h1>
          <p className="mt-2 text-[0.9rem] text-ink-soft">
            {mode === "signin"
              ? "Track your orders and saved details."
              : mode === "signup"
                ? "One account for orders, tracking and queue updates."
                : "We'll email you a link to set a new password."}
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              className="border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none transition-colors placeholder:text-ink-soft/65 focus:border-ink"
            />
            {mode !== "forgot" && (
              <div className="flex items-stretch border border-hairline transition-colors focus-within:border-ink">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={mode === "signup" ? PASSWORD_MIN : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? `password — ${PASSWORD_HINT.toLowerCase()}` : "password"}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none placeholder:text-ink-soft/65"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="label-mono px-3.5 !text-[0.6rem] text-ink-soft transition-colors hover:text-brg"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="label-mono mt-2 cursor-pointer border border-transparent bg-brg px-6 py-3.5 text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
            >
              {busy
                ? "…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </button>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setMode("forgot");
                }}
                className="label-mono mt-1 cursor-pointer self-start !text-[0.66rem] text-ink-soft transition-colors hover:text-brg"
              >
                Forgot password?
              </button>
            )}

            {error && (
              <div className="label-mono !text-[0.68rem] !tracking-[0.08em] text-brg">
                {error}
              </div>
            )}
            {needsConfirm && (
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={busy}
                className="label-mono cursor-pointer self-start !text-[0.66rem] text-ink underline underline-offset-4 hover:text-brg"
              >
                Resend confirmation email
              </button>
            )}
            {notice && (
              <div className="label-mono !text-[0.68rem] !tracking-[0.08em] text-brass">
                {notice}
              </div>
            )}
          </form>

          <button
            onClick={() => {
              reset();
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            className="label-mono mt-6 cursor-pointer !text-[0.68rem] text-ink-soft transition-colors hover:text-brg"
          >
            {mode === "signin"
              ? "No account yet? Create one →"
              : "Already registered? Sign in →"}
          </button>
        </div>
      </div>
    </main>
  );
}
