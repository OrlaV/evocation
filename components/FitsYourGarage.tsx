"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/* Shows a "fits your car" line on a product page when one of the signed-in
   customer's garage vehicles matches the part's fitment. Fetched client-side so
   the product page stays statically generated. Renders nothing for signed-out
   visitors or non-matches. */
export default function FitsYourGarage({
  vehicleKeys,
}: {
  vehicleKeys: string[];
}) {
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    if (!vehicleKeys.length) return;
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("garage_vehicles")
        .select("make, model, vehicle_key");
      if (cancelled || !data) return;
      const keys = new Set(vehicleKeys);
      const hits = data
        .filter((v) => keys.has(v.vehicle_key as string))
        .map((v) => `${v.make} ${v.model}`);
      setMatches(hits);
    })();
    return () => {
      cancelled = true;
    };
  }, [vehicleKeys]);

  if (!matches.length) return null;

  return (
    <div className="mt-4 flex items-center gap-2 border border-brg/40 bg-brg/5 px-3 py-2">
      <span className="font-num text-brg">✓</span>
      <span className="label-mono !text-[0.66rem] !tracking-[0.08em] text-ink">
        Fits your {matches.join(", ")}
      </span>
    </div>
  );
}
