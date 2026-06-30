"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <div className="w-full max-w-[400px] border border-hairline bg-cream-card p-[6px]">
        <div className="border border-hairline px-7 py-9">
          <div className="label-mono !tracking-[0.18em] text-brg">
            Workshop access
          </div>
          <h1 className="font-display mt-2 text-[1.5rem] font-bold">
            Admin sign-in
          </h1>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              className="border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none transition-colors placeholder:text-ink-soft/65 focus:border-ink"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.06em] text-ink outline-none transition-colors placeholder:text-ink-soft/65 focus:border-ink"
            />
            <button
              type="submit"
              disabled={busy}
              className="label-mono mt-2 cursor-pointer border border-transparent bg-brg px-6 py-3.5 text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Enter the workshop"}
            </button>
            {error && (
              <div className="label-mono !text-[0.68rem] text-brg">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
