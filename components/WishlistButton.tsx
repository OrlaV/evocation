"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toggleWishlistAction } from "@/app/actions/wishlist";

type State = "loading" | "signedout" | "in" | "out";

/* Save-for-later heart. Reads the state client-side so the product page stays
   statically generated. Signed-out visitors get a sign-in link. */
export default function WishlistButton({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [state, setState] = useState<State>("loading");
  const [pending, start] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) return setState("signedout");
      const { data } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("product_id", productId)
        .maybeSingle();
      if (!cancelled) setState(data ? "in" : "out");
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const cls =
    "label-mono inline-flex items-center gap-1.5 border px-3 py-2 !text-[0.66rem] transition-colors cursor-pointer";

  if (state === "loading")
    return <span className={`${cls} border-hairline text-ink-soft/40`}>♡ Save</span>;

  if (state === "signedout")
    return (
      <a
        href="/account/login"
        className={`${cls} border-hairline text-ink-soft no-underline hover:border-brg hover:text-brg`}
      >
        ♡ Save for later
      </a>
    );

  const saved = state === "in";
  const toggle = () =>
    start(async () => {
      const r = await toggleWishlistAction(productId, slug);
      if (r.ok) setState(r.saved ? "in" : "out");
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      className={`${cls} disabled:opacity-60 ${
        saved
          ? "border-brg bg-brg/5 text-brg"
          : "border-hairline text-ink-soft hover:border-brg hover:text-brg"
      }`}
    >
      {saved ? "♥ Saved" : "♡ Save for later"}
    </button>
  );
}
