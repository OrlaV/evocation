"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { normalizeRef, optionRefs } from "@/lib/types";
import { vehicleKey } from "@/lib/vehicles";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { PartCard } from "./Registry";

const SORTS = [
  { key: "first", label: "First revived" },
  { key: "latest", label: "Latest revived" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "evo", label: "Part no." },
] as const;

type SortKey = (typeof SORTS)[number]["key"];
const SORT_KEYS = SORTS.map((s) => s.key) as readonly string[];

// does a product match a free-text query (name, OEM refs, or vehicle)?
function matches(p: Product, q: string): boolean {
  const ql = q.trim().toLowerCase();
  if (!ql) return true;
  if (p.name.toLowerCase().includes(ql)) return true;
  if (p.fitment.some((f) => `${f.make} ${f.model}`.toLowerCase().includes(ql)))
    return true;
  const n = normalizeRef(q);
  if (n.length >= 3 && optionRefs(p).some((r) => normalizeRef(r).includes(n)))
    return true;
  return false;
}

export type ShopFilters = {
  q?: string;
  make?: string;
  model?: string;
  hand?: string;
  sort?: string;
};

export default function ShopGrid({
  products,
  initial = {},
}: {
  products: Product[];
  initial?: ShopFilters;
}) {
  const [sort, setSort] = useState<SortKey>(
    (SORT_KEYS.includes(initial.sort ?? "") ? initial.sort : "first") as SortKey,
  );
  const [query, setQuery] = useState(initial.q ?? "");
  const [make, setMake] = useState<string>(initial.make ?? "");
  const [model, setModel] = useState<string>(initial.model ?? "");
  const [hand, setHand] = useState<string>(initial.hand ?? "");
  // the signed-in customer's garage vehicle keys, for the "fits my car" filter
  const [garageKeys, setGarageKeys] = useState<string[]>([]);
  const [onlyGarage, setOnlyGarage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("garage_vehicles")
        .select("vehicle_key");
      if (cancelled || !data) return;
      setGarageKeys(data.map((v) => v.vehicle_key as string));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // makes present in the catalogue, for the filter
  const makes = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.fitment.forEach((f) => f.make && s.add(f.make)));
    return [...s].sort();
  }, [products]);

  // models for the selected make (all models when no make is picked)
  const models = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) =>
      p.fitment.forEach((f) => {
        if ((!make || f.make === make) && f.model) s.add(f.model);
      }),
    );
    return [...s].sort();
  }, [products, make]);

  // only surface the hand-of-drive filter when parts actually declare it
  const hasHand = useMemo(
    () => products.some((p) => p.fitment.some((f) => f.hand)),
    [products],
  );

  // changing make clears a now-irrelevant model (done in the handler, not an
  // effect, to avoid a cascading re-render)
  const pickMake = (m: string) => {
    setMake(m);
    setModel("");
  };

  // keep the URL in sync so any filtered view is shareable (copy the link and
  // it reopens with the same search / facets). replaceState avoids a nav.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (hand) params.set("hand", hand);
    if (sort !== "first") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  }, [query, make, model, hand, sort]);

  const visible = useMemo(() => {
    const garageSet = new Set(garageKeys);
    const list = products.filter(
      (p) =>
        (!make || p.fitment.some((f) => f.make === make)) &&
        (!model || p.fitment.some((f) => f.model === model)) &&
        (!hand || p.fitment.some((f) => f.hand === hand)) &&
        (!onlyGarage ||
          p.fitment.some((f) => garageSet.has(vehicleKey(f.make, f.model)))) &&
        matches(p, query),
    );
    const byDate = (a: Product, b: Product) =>
      new Date(a.created_at ?? 0).getTime() -
      new Date(b.created_at ?? 0).getTime();
    switch (sort) {
      case "first":
        return list.sort(byDate);
      case "latest":
        return list.sort((a, b) => byDate(b, a));
      case "price-asc":
        return list.sort((a, b) => a.price_pence - b.price_pence);
      case "price-desc":
        return list.sort((a, b) => b.price_pence - a.price_pence);
      case "evo":
        return list.sort((a, b) => a.evo_no.localeCompare(b.evo_no));
    }
  }, [products, sort, query, make, model, hand, onlyGarage, garageKeys]);

  const chip = (active: boolean) =>
    `label-mono cursor-pointer border px-2.5 py-1 !text-[0.64rem] transition-colors ${
      active
        ? "border-ink bg-ink text-cream"
        : "border-hairline text-ink-soft hover:border-ink"
    }`;

  return (
    <>
      {/* search */}
      <div className="mb-4 flex w-full max-w-[520px] border border-hairline transition-colors focus-within:border-ink">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a part name, vehicle, or original ref. no."
          aria-label="Search the registry"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.04em] text-ink outline-none placeholder:text-ink-soft/65"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="label-mono px-4 text-ink-soft transition-colors hover:text-brg"
          >
            ✕
          </button>
        )}
      </div>

      {/* "fits my garage" — only when the customer has saved cars */}
      {garageKeys.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setOnlyGarage((v) => !v)}
            className={`label-mono cursor-pointer border px-3 py-1.5 !text-[0.64rem] transition-colors ${
              onlyGarage
                ? "border-brg bg-brg text-cream"
                : "border-brg text-brg hover:bg-brg/10"
            }`}
          >
            {onlyGarage ? "✓ " : ""}Fits my garage
          </button>
        </div>
      )}

      {/* make filter */}
      {makes.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="label-mono w-14 !text-[0.64rem] !tracking-[0.12em] text-ink-soft">
            Make
          </span>
          <button onClick={() => pickMake("")} className={chip(make === "")}>
            All
          </button>
          {makes.map((m) => (
            <button key={m} onClick={() => pickMake(m)} className={chip(make === m)}>
              {m}
            </button>
          ))}
        </div>
      )}

      {/* model filter */}
      {models.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="label-mono w-14 !text-[0.64rem] !tracking-[0.12em] text-ink-soft">
            Model
          </span>
          <button onClick={() => setModel("")} className={chip(model === "")}>
            All
          </button>
          {models.map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={chip(model === m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* hand of drive filter */}
      {hasHand && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="label-mono w-14 !text-[0.64rem] !tracking-[0.12em] text-ink-soft">
            Drive
          </span>
          <button onClick={() => setHand("")} className={chip(hand === "")}>
            Any
          </button>
          {["LHD", "RHD"].map((h) => (
            <button key={h} onClick={() => setHand(h)} className={chip(hand === h)}>
              {h}
            </button>
          ))}
        </div>
      )}

      {/* sort */}
      <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-hairline py-3">
        <span className="label-mono !text-[0.66rem] !tracking-[0.12em] text-ink-soft">
          Sort
        </span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`label-mono cursor-pointer !text-[0.68rem] transition-colors ${
              sort === s.key
                ? "text-brg underline underline-offset-4"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
          No parts match{query ? ` “${query}”` : ""}
          {make ? ` for ${make}` : ""}. Try a different search, or{" "}
          <a href="/#queue" className="text-brg hover:underline">
            request it
          </a>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[clamp(20px,3vw,40px)] min-[861px]:grid-cols-2">
          {visible.map((part, i) => (
            <PartCard key={part.evo_no} part={part} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
