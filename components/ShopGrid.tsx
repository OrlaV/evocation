"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { normalizeRef, optionRefs } from "@/lib/types";
import { PartCard } from "./Registry";

const SORTS = [
  { key: "first", label: "First revived" },
  { key: "latest", label: "Latest revived" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "evo", label: "Part no." },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

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

export default function ShopGrid({
  products,
  initialQuery = "",
}: {
  products: Product[];
  initialQuery?: string;
}) {
  const [sort, setSort] = useState<SortKey>("first");
  const [query, setQuery] = useState(initialQuery);
  const [make, setMake] = useState<string>("");

  // makes present in the catalogue, for the filter
  const makes = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.fitment.forEach((f) => f.make && s.add(f.make)));
    return [...s].sort();
  }, [products]);

  const visible = useMemo(() => {
    const list = products.filter(
      (p) =>
        (!make || p.fitment.some((f) => f.make === make)) && matches(p, query),
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
  }, [products, sort, query, make]);

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

      {/* make filter */}
      {makes.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="label-mono !text-[0.64rem] !tracking-[0.12em] text-ink-soft">
            Make
          </span>
          <button
            onClick={() => setMake("")}
            className={`label-mono cursor-pointer border px-2.5 py-1 !text-[0.64rem] transition-colors ${
              make === ""
                ? "border-ink bg-ink text-cream"
                : "border-hairline text-ink-soft hover:border-ink"
            }`}
          >
            All
          </button>
          {makes.map((m) => (
            <button
              key={m}
              onClick={() => setMake(m)}
              className={`label-mono cursor-pointer border px-2.5 py-1 !text-[0.64rem] transition-colors ${
                make === m
                  ? "border-ink bg-ink text-cream"
                  : "border-hairline text-ink-soft hover:border-ink"
              }`}
            >
              {m}
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
