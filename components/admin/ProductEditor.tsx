"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Product,
  Fitment,
  FaqItem,
  PurchaseOption,
  GalleryImage,
} from "@/lib/types";
import { BODY_STYLES } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import {
  saveProductAction,
  deleteProductAction,
  type ProductPayload,
} from "@/app/admin/actions";
import { PartCard } from "@/components/Registry";
import { MAKES, modelsForMake } from "@/lib/vehicles";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const inputCls =
  "w-full border border-hairline bg-transparent px-3 py-2.5 font-mono text-[0.82rem] tracking-[0.04em] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-ink";

function Field({
  label,
  children,
  span = false,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <label className={`block ${span ? "col-span-2" : ""}`}>
      <span className="label-mono mb-1.5 block !text-[0.65rem] !tracking-[0.14em] text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({ no, title }: { no: string; title: string }) {
  return (
    <div className="label-mono mt-8 mb-4 flex items-center gap-3 !text-[0.68rem] text-brg after:h-px after:flex-1 after:bg-hairline after:content-['']">
      {no} — {title}
    </div>
  );
}

export default function ProductEditor({
  product,
  nextEvoNo,
  defaultSlots = 5,
}: {
  product: Product | null;
  nextEvoNo: string;
  defaultSlots?: number;
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // unsaved-changes guard
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const [form, setForm] = useState<ProductPayload>(() =>
    product
      ? { ...product }
      : {
          evo_no: nextEvoNo,
          slug: "",
          name: "",
          status: "draft",
          badge: "NLA",
          oem_refs: [""],
          maker: "",
          fitted_from: null,
          fitted_to: null,
          discontinued_year: "",
          revived_year: new Date().getFullYear(),
          fitment: [{ make: "", model: "", years: "" }],
          options: [],
          gallery: [],
          material: "ASA, automotive grade — UV-stable",
          slots: defaultSlots,
          price_pence: 0,
          lead_time_days: 5,
          in_stock: false,
          used_price_note: "",
          story_md: "",
          faq: [{ q: "", a: "" }],
        },
  );

  const set = <K extends keyof ProductPayload>(
    key: K,
    value: ProductPayload[K],
  ) => {
    setDirty(true);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setName = (name: string) => {
    setDirty(true);
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugify(name),
    }));
  };

  /* live preview model */
  const preview: Product = useMemo(
    () => ({
      ...form,
      id: form.id ?? "preview",
      gallery: [],
    }),
    [form],
  );

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const res = await saveProductAction({
      ...form,
      maker: form.maker || null,
      badge: form.badge?.trim() || null,
      slots: Number(form.slots) > 0 ? Number(form.slots) : 5,
      discontinued_year: form.discontinued_year || null,
      used_price_note: form.used_price_note || null,
      story_md: form.story_md || null,
      fitment: form.fitment.filter((f) => f.model.trim()),
      faq: form.faq.filter((f) => f.q.trim()),
      oem_refs: form.oem_refs.map((r) => r.trim()).filter(Boolean),
      options: (() => {
        const seen = new Set<string>();
        return (form.options ?? [])
          .filter((o) => o.label.trim() && o.items.some((it) => it.ref.trim()))
          .map((o, i) => {
            let key = o.key || slugify(o.label) || `option-${i + 1}`;
            while (seen.has(key)) key = `${key}-${i + 1}`;
            seen.add(key);
            return {
              ...o,
              key,
              items: o.items
                .map((it) => ({ ref: it.ref.trim(), qty: it.qty || 1 }))
                .filter((it) => it.ref),
            };
          });
      })(),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setMsg(res.notice ?? "Saved.");
    setDirty(false);
    if (!form.id) {
      router.replace(`/admin/parts/${res.id}`);
    }
    router.refresh();
  };

  const remove = async () => {
    if (!form.id) return;
    if (
      !window.confirm(
        `Delete ${form.evo_no} — ${form.name}? This cannot be undone. (Unpublishing is usually the better move.)`,
      )
    )
      return;
    setBusy(true);
    const res = await deleteProductAction(form.id);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setDirty(false);
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 items-start gap-10 min-[1100px]:grid-cols-[7fr_5fr]">
      {/* ---------- form ---------- */}
      <div>
        <SectionTitle no="01" title="Identity" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Part name" span>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Interior Cup Handle"
            />
          </Field>
          <Field label="EVO number">
            <input
              className={inputCls}
              value={form.evo_no}
              onChange={(e) => set("evo_no", e.target.value)}
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </Field>
          <Field label="Status badge (shown on card & page)">
            <input
              className={inputCls}
              value={form.badge ?? ""}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="NLA / Hard to find / Cracks with age"
            />
          </Field>
          <Field label="Original maker">
            <input
              className={inputCls}
              value={form.maker ?? ""}
              onChange={(e) => set("maker", e.target.value)}
              placeholder="Land Rover"
            />
          </Field>
        </div>

        {/* original refs — one field per reference (left/right parts, supersessions) */}
        <div className="mt-4">
          <span className="label-mono mb-1.5 block !text-[0.65rem] !tracking-[0.14em] text-ink-soft">
            Original refs
          </span>
          {form.oem_refs.map((r, i) => (
            <div key={i} className="mb-2 flex gap-3">
              <input
                className={inputCls}
                placeholder="e.g. 928.521.147.02"
                value={r}
                onChange={(e) => {
                  const next = [...form.oem_refs];
                  next[i] = e.target.value;
                  set("oem_refs", next);
                }}
              />
              <button
                type="button"
                aria-label="Remove reference"
                onClick={() =>
                  set(
                    "oem_refs",
                    form.oem_refs.filter((_, j) => j !== i),
                  )
                }
                className="label-mono cursor-pointer px-2 !text-[0.68rem] text-ink-soft hover:text-brg"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("oem_refs", [...form.oem_refs, ""])}
            className="label-mono cursor-pointer !text-[0.68rem] text-brg hover:underline"
          >
            + Add reference
          </button>
        </div>

        <SectionTitle no="02" title="Part biography" />
        <div className="grid grid-cols-4 gap-4">
          <Field label="Fitted from">
            <input
              type="number"
              className={inputCls}
              value={form.fitted_from ?? ""}
              onChange={(e) =>
                set("fitted_from", e.target.value ? +e.target.value : null)
              }
            />
          </Field>
          <Field label="Fitted to">
            <input
              type="number"
              className={inputCls}
              value={form.fitted_to ?? ""}
              onChange={(e) =>
                set("fitted_to", e.target.value ? +e.target.value : null)
              }
            />
          </Field>
          <Field label="Discontinued (~)">
            <input
              className={inputCls}
              value={form.discontinued_year ?? ""}
              onChange={(e) => set("discontinued_year", e.target.value)}
              placeholder="~2002"
            />
          </Field>
          <Field label="Revived">
            <input
              type="number"
              className={inputCls}
              value={form.revived_year ?? ""}
              onChange={(e) =>
                set("revived_year", e.target.value ? +e.target.value : null)
              }
            />
          </Field>
        </div>

        <SectionTitle no="03" title="Fitment — vehicles this part fits" />
        <p className="mb-3 max-w-[60ch] font-mono text-[0.72rem] leading-[1.5] text-ink-soft/75">
          One row per vehicle. Add as many as you like — several models, or even
          different makes, can share the same part. Start typing to pick from the
          list; anything you type is accepted.
        </p>
        {/* shared make suggestions */}
        <datalist id="evo-makes">
          {MAKES.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        {form.fitment.map((f, i) => {
          const setField = (k: keyof Fitment, value: string) => {
            const next = [...form.fitment];
            next[i] = { ...next[i], [k]: value } as Fitment;
            set("fitment", next);
          };
          return (
            <div key={i} className="mb-3 border border-hairline/60 p-3">
              {/* essentials — make · model · years */}
              <div className="grid grid-cols-[1.1fr_1.1fr_0.9fr_auto] gap-3">
                <input
                  className={inputCls}
                  list="evo-makes"
                  placeholder="make"
                  value={f.make ?? ""}
                  onChange={(e) => setField("make", e.target.value)}
                />
                <input
                  className={inputCls}
                  list={`evo-models-${i}`}
                  placeholder="model"
                  value={f.model ?? ""}
                  onChange={(e) => setField("model", e.target.value)}
                />
                {/* model suggestions filtered by this row's make */}
                <datalist id={`evo-models-${i}`}>
                  {modelsForMake(f.make).map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <input
                  className={inputCls}
                  placeholder="years e.g. 1990–1996"
                  value={f.years ?? ""}
                  onChange={(e) => setField("years", e.target.value)}
                />
                <button
                  type="button"
                  aria-label="Remove vehicle"
                  onClick={() =>
                    set(
                      "fitment",
                      form.fitment.filter((_, j) => j !== i),
                    )
                  }
                  className="label-mono cursor-pointer px-2 !text-[0.68rem] text-ink-soft hover:text-brg"
                >
                  ✕
                </button>
              </div>
              {/* optional variant facets — body · phase · hand of drive */}
              <div className="mt-2.5 grid grid-cols-3 gap-3">
                <select
                  className={inputCls}
                  value={f.body ?? ""}
                  onChange={(e) => setField("body", e.target.value)}
                >
                  <option value="">Body — all</option>
                  {BODY_STYLES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <input
                  className={inputCls}
                  placeholder="phase / spec (optional)"
                  value={f.phase ?? ""}
                  onChange={(e) => setField("phase", e.target.value)}
                />
                <select
                  className={inputCls}
                  value={f.hand ?? ""}
                  onChange={(e) => setField("hand", e.target.value)}
                >
                  <option value="">Drive — either</option>
                  <option value="LHD">LHD</option>
                  <option value="RHD">RHD</option>
                </select>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => {
            const last = form.fitment[form.fitment.length - 1];
            // inherit the previous make so adding several models of one make is quick
            set("fitment", [
              ...form.fitment,
              { make: last?.make ?? "", model: "", years: "" } as Fitment,
            ]);
          }}
          className="label-mono cursor-pointer !text-[0.68rem] text-brg hover:underline"
        >
          + Add vehicle
        </button>

        <SectionTitle no="04" title="Price & availability" />
        <div className="grid grid-cols-4 gap-4">
          <Field label="Price (£)">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.price_pence ? form.price_pence / 100 : ""}
              onChange={(e) =>
                set("price_pence", Math.round(+e.target.value * 100) || 0)
              }
            />
          </Field>
          <Field label="Lead time (days)">
            <input
              type="number"
              className={inputCls}
              value={form.lead_time_days}
              onChange={(e) => set("lead_time_days", +e.target.value || 0)}
            />
          </Field>
          <Field label="Used price note">
            <input
              className={inputCls}
              value={form.used_price_note ?? ""}
              onChange={(e) => set("used_price_note", e.target.value)}
              placeholder="£80+"
            />
          </Field>
          <Field label="In stock">
            <button
              type="button"
              onClick={() => set("in_stock", !form.in_stock)}
              className={`label-mono w-full cursor-pointer border px-3 py-2.5 !text-[0.68rem] transition-colors ${
                form.in_stock
                  ? "border-brg bg-brg text-cream"
                  : "border-hairline text-ink-soft"
              }`}
            >
              {form.in_stock ? "In stock" : "Printed to order"}
            </button>
          </Field>
          <Field label="Shipping slots (cart total → box: S ≤15 · M ≤45 · L +)">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.slots ?? 5}
              onChange={(e) => set("slots", e.target.value ? +e.target.value : 0)}
              placeholder="5"
            />
          </Field>
          <Field label="Material" span>
            <input
              className={inputCls}
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="ASA, automotive grade — UV-stable / PA6-CF, carbon-reinforced"
            />
          </Field>
        </div>

        <SectionTitle no="05" title="Purchase options (sides / bundles) — optional" />
        <p className="mb-3 max-w-[60ch] font-mono text-[0.72rem] leading-[1.5] text-ink-soft/75">
          Leave empty to sell as a single piece at the price above. Add options
          when a part has sides or bundles — e.g. <b>Left side</b>,{" "}
          <b>Right side</b>, <b>Pair — both sides</b>, <b>Full set ×4</b>. Each
          option has its own price and lists the original ref(s) it includes
          with quantity. A single-piece option (one ref, qty 1) also labels that
          ref on the product page and in SEO. <b>Order matters</b> — use ↑ ↓ to
          reorder; the <b>first option is selected by default</b> on the product
          page (make it your base option).
        </p>
        <datalist id="evo-option-refs">
          {[...new Set(form.oem_refs.map((r) => r.trim()).filter(Boolean))].map(
            (r) => (
              <option key={r} value={r} />
            ),
          )}
        </datalist>
        {(form.options ?? []).map((o, oi) => {
          const setOpt = (patch: Partial<PurchaseOption>) => {
            const next = [...(form.options ?? [])];
            next[oi] = { ...next[oi], ...patch };
            set("options", next);
          };
          const setItem = (
            ii: number,
            patch: Partial<{ ref: string; qty: number }>,
          ) => {
            const items = [...o.items];
            items[ii] = { ...items[ii], ...patch };
            setOpt({ items });
          };
          return (
            <div key={oi} className="mb-4 border border-hairline/60 p-3">
              <div className="grid grid-cols-[1.3fr_0.6fr_0.9fr_auto] gap-3">
                <input
                  className={inputCls}
                  placeholder="Option label e.g. Pair — both sides"
                  value={o.label}
                  onChange={(e) =>
                    setOpt({
                      label: e.target.value,
                      key: slugify(e.target.value),
                    })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  placeholder="£"
                  value={o.price_pence ? o.price_pence / 100 : ""}
                  onChange={(e) =>
                    setOpt({
                      price_pence: Math.round(+e.target.value * 100) || 0,
                    })
                  }
                />
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  placeholder="slots (opt.)"
                  value={o.slots ?? ""}
                  onChange={(e) =>
                    setOpt({
                      slots: e.target.value ? +e.target.value : undefined,
                    })
                  }
                  title="Shipping slots for this option (overrides the product slots)"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move option up"
                    disabled={oi === 0}
                    onClick={() => {
                      const next = [...(form.options ?? [])];
                      [next[oi - 1], next[oi]] = [next[oi], next[oi - 1]];
                      set("options", next);
                    }}
                    className="cursor-pointer px-1.5 text-[0.85rem] text-ink-soft hover:text-brg disabled:cursor-default disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move option down"
                    disabled={oi === (form.options?.length ?? 0) - 1}
                    onClick={() => {
                      const next = [...(form.options ?? [])];
                      [next[oi + 1], next[oi]] = [next[oi], next[oi + 1]];
                      set("options", next);
                    }}
                    className="cursor-pointer px-1.5 text-[0.85rem] text-ink-soft hover:text-brg disabled:cursor-default disabled:opacity-25"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Remove option"
                    onClick={() =>
                      set(
                        "options",
                        (form.options ?? []).filter((_, j) => j !== oi),
                      )
                    }
                    className="label-mono cursor-pointer px-2 !text-[0.68rem] text-ink-soft hover:text-brg"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-2.5 border-l-2 border-hairline pl-3">
                {o.items.map((it, ii) => (
                  <div
                    key={ii}
                    className="mb-2 grid grid-cols-[1.6fr_0.7fr_auto] gap-3"
                  >
                    <input
                      className={inputCls}
                      list="evo-option-refs"
                      placeholder="original ref"
                      value={it.ref}
                      onChange={(e) => setItem(ii, { ref: e.target.value })}
                    />
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      placeholder="qty"
                      value={it.qty || ""}
                      onChange={(e) =>
                        setItem(ii, { qty: +e.target.value || 1 })
                      }
                    />
                    <button
                      type="button"
                      aria-label="Remove piece"
                      onClick={() =>
                        setOpt({ items: o.items.filter((_, j) => j !== ii) })
                      }
                      className="label-mono cursor-pointer px-2 !text-[0.68rem] text-ink-soft hover:text-brg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setOpt({ items: [...o.items, { ref: "", qty: 1 }] })}
                  className="label-mono cursor-pointer !text-[0.66rem] text-brg hover:underline"
                >
                  + Add piece
                </button>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            set("options", [
              ...(form.options ?? []),
              {
                key: "",
                label: "",
                price_pence: 0,
                items: [{ ref: "", qty: 1 }],
              } as PurchaseOption,
            ])
          }
          className="label-mono cursor-pointer !text-[0.68rem] text-brg hover:underline"
        >
          + Add purchase option
        </button>

        <SectionTitle no="06" title="Gallery — first image is the hero" />
        <p className="mb-3 max-w-[60ch] font-mono text-[0.72rem] leading-[1.5] text-ink-soft/75">
          Upload product photos (JP, PNG, WebP). Drag with ↑ ↓ to order — the
          first one is the hero shot on the product page. Add an alt description
          for accessibility &amp; SEO.
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="label-mono chamfer cursor-pointer bg-ink px-4 py-2.5 !text-[0.68rem] text-cream transition-colors hover:bg-ink-soft">
            {uploading ? "Uploading…" : "+ Upload images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files?.length) return;
                setUploading(true);
                setMsg(null);
                const added: GalleryImage[] = [];
                for (const file of Array.from(files)) {
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("slug", form.slug || form.evo_no || "misc");
                  try {
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      body: fd,
                    });
                    const data = (await res.json()) as {
                      path?: string;
                      error?: string;
                    };
                    if (data.path) added.push({ path: data.path, alt: "" });
                    else setMsg(data.error ?? "Upload failed.");
                  } catch {
                    setMsg("Upload failed.");
                  }
                }
                if (added.length)
                  set("gallery", [...(form.gallery ?? []), ...added]);
                setUploading(false);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {(form.gallery ?? []).map((g, gi) => {
          const list = form.gallery ?? [];
          const move = (to: number) => {
            if (to < 0 || to >= list.length) return;
            const next = [...list];
            [next[to], next[gi]] = [next[gi], next[to]];
            set("gallery", next);
          };
          return (
            <div
              key={g.path + gi}
              className="mb-2 flex items-center gap-3 border border-hairline/60 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(g.path)}
                alt={g.alt || "product image"}
                className="h-12 w-16 flex-none border border-hairline object-cover"
              />
              <input
                className={inputCls}
                placeholder="alt description (e.g. Left cover, grain detail)"
                value={g.alt}
                onChange={(e) => {
                  const next = [...list];
                  next[gi] = { ...next[gi], alt: e.target.value };
                  set("gallery", next);
                }}
              />
              {gi === 0 && (
                <span className="label-mono flex-none !text-[0.6rem] text-brg">
                  HERO
                </span>
              )}
              <button
                type="button"
                aria-label="Move up"
                disabled={gi === 0}
                onClick={() => move(gi - 1)}
                className="cursor-pointer px-1.5 text-[0.85rem] text-ink-soft hover:text-brg disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={gi === list.length - 1}
                onClick={() => move(gi + 1)}
                className="cursor-pointer px-1.5 text-[0.85rem] text-ink-soft hover:text-brg disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() =>
                  set(
                    "gallery",
                    list.filter((_, j) => j !== gi),
                  )
                }
                className="label-mono cursor-pointer px-2 !text-[0.68rem] text-ink-soft hover:text-brg"
              >
                ✕
              </button>
            </div>
          );
        })}

        <SectionTitle no="07" title="Story (markdown, paragraphs separated by blank line)" />
        <textarea
          className={`${inputCls} min-h-[160px] leading-[1.6]`}
          value={form.story_md ?? ""}
          onChange={(e) => set("story_md", e.target.value)}
        />

        <SectionTitle no="08" title="FAQ" />
        {form.faq.map((f, i) => (
          <div key={i} className="mb-4 border-l-2 border-hairline pl-3">
            <div className="flex gap-3">
              <input
                className={inputCls}
                placeholder="Question"
                value={f.q}
                onChange={(e) => {
                  const next = [...form.faq];
                  next[i] = { ...next[i], q: e.target.value };
                  set("faq", next);
                }}
              />
              <button
                type="button"
                onClick={() => set("faq", form.faq.filter((_, j) => j !== i))}
                className="label-mono cursor-pointer px-2 !text-[0.68rem] text-ink-soft hover:text-brg"
              >
                ✕
              </button>
            </div>
            <textarea
              className={`${inputCls} mt-2 min-h-[60px]`}
              placeholder="Answer"
              value={f.a}
              onChange={(e) => {
                const next = [...form.faq];
                next[i] = { ...next[i], a: e.target.value };
                set("faq", next);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("faq", [...form.faq, { q: "", a: "" } as FaqItem])}
          className="label-mono cursor-pointer !text-[0.68rem] text-brg hover:underline"
        >
          + Add FAQ item
        </button>

        <SectionTitle no="09" title="Status" />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() =>
              set("status", form.status === "published" ? "draft" : "published")
            }
            className={`label-mono cursor-pointer border px-4 py-2.5 !text-[0.68rem] transition-colors ${
              form.status === "published"
                ? "border-brg bg-brg text-cream"
                : "border-hairline text-ink-soft"
            }`}
          >
            {form.status === "published" ? "Published" : "Draft"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="label-mono cursor-pointer border border-transparent bg-brg px-7 py-3 text-cream transition-colors hover:bg-brg-deep disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save part"}
          </button>
          {msg && (
            <span
              className={`label-mono !text-[0.68rem] ${
                msg === "Saved." ? "text-brg" : "text-brass"
              }`}
            >
              {msg}
            </span>
          )}
          {form.id && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="label-mono ml-auto cursor-pointer border border-hairline px-4 py-2.5 !text-[0.66rem] text-ink-soft transition-colors hover:border-brg hover:text-brg disabled:opacity-60"
            >
              Delete part
            </button>
          )}
        </div>
      </div>

      {/* ---------- live preview ---------- */}
      <div className="min-[1100px]:sticky min-[1100px]:top-24">
        <div className="label-mono mb-4 flex items-center gap-3 !text-[0.68rem] text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
          Live preview — registry card
        </div>
        <PartCard part={preview} index={0} />
        <div className="label-mono mt-3 flex flex-wrap gap-x-4 gap-y-1 !text-[0.65rem] !tracking-[0.1em] text-ink-soft/80">
          {form.id && form.slug ? (
            <a
              href={`/parts/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-brg hover:underline"
            >
              View public page ↗
            </a>
          ) : (
            <span>Public page: /parts/{form.slug || "…"}</span>
          )}
          <span>Gallery upload arrives with Storage wiring.</span>
        </div>
      </div>
    </div>
  );
}
