"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { createReviewAction } from "@/app/actions/reviews";

/* Review submission, shown under a product's reviews. Signed-in customers get
   the form; the server action enforces verified-buyer. Signed-out visitors see
   a sign-in prompt. */
export default function ReviewForm({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) setSignedIn(!!user);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (signedIn === null) return null;

  if (!signedIn) {
    return (
      <p className="mt-6 text-[0.9rem] text-ink-soft">
        Bought this part?{" "}
        <a href="/account/login" className="text-brg hover:underline">
          Sign in to review it →
        </a>
      </p>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await createReviewAction({ productId, slug, rating, title, body });
      if (r.ok) {
        setMsg({ text: r.message ?? "Thanks!", ok: true });
        setRating(0);
        setTitle("");
        setBody("");
      } else {
        setMsg({ text: r.error ?? "Couldn't submit.", ok: false });
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 border-t border-hairline pt-6">
      <div className="label-mono mb-2 !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
        Write a review
      </div>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`cursor-pointer text-[1.4rem] leading-none transition-colors ${
              n <= (hover || rating) ? "text-brg" : "text-ink-soft/40"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        aria-label="Review title (optional)"
        className="mt-3 w-full border border-hairline bg-transparent px-3 py-2.5 font-mono text-[0.82rem] outline-none focus:border-ink"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How does it fit? How's the finish?"
        rows={3}
        aria-label="Your review"
        className="mt-2 w-full border border-hairline bg-transparent px-3 py-2.5 font-mono text-[0.82rem] outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={pending || rating < 1}
        className="label-mono chamfer mt-3 cursor-pointer bg-brg px-5 py-3 font-bold text-cream transition-colors hover:bg-brg-deep disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
      {msg && (
        <div
          className={`label-mono mt-3 !text-[0.66rem] ${msg.ok ? "text-brass" : "text-brg"}`}
        >
          {msg.text}
        </div>
      )}
    </form>
  );
}
