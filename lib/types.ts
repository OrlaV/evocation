// Hand of drive — set only when the part is LHD/RHD-specific (asymmetric trim:
// handbrake surrounds, glovebox, switch panels…). Left empty for symmetric parts.
export type DriveSide = "LHD" | "RHD";

export type Fitment = {
  make: string;
  model: string;
  // structured variant facets (2026-06-29) — the axes that actually change
  // interior/trim fitment within one model/generation. Descriptive for now;
  // matching still rides on make+model only (see fitment_keys / vehicle_key).
  body?: string; // body style — "Coupé", "Cabriolet", "2-door", "4-door"…
  phase?: string; // production phase / sub-spec — "Pre-facelift", "S4 / GT / GTS"
  hand?: DriveSide | ""; // hand of drive, when the part is LHD/RHD-specific
  variant?: string; // legacy free-text (pre-2026-06-29) — read-only display fallback
  years: string;
};

// curated body-style vocabulary for the fitment editor ("" = all / unspecified)
export const BODY_STYLES = [
  "Coupé",
  "Cabriolet / Convertible",
  "Targa",
  "Roadster",
  "2-door",
  "4-door",
  "Saloon / Sedan",
  "Estate / Wagon",
  "Hatchback",
  "SUV",
] as const;

// compose the structured facets into one readable spec for the fitment table,
// falling back to the legacy free-text variant, then to "All".
export const fitmentSpec = (f: Fitment): string => {
  const parts = [f.body, f.phase, f.hand].filter(
    (x): x is string => Boolean(x && x.trim()),
  );
  if (parts.length) return parts.join(" · ");
  if (f.variant?.trim()) return f.variant;
  return "All";
};

export type FaqItem = { q: string; a: string };

export type GalleryImage = { path: string; alt: string };

// Royal Mail parcel tiers — drive the shipping cost (lib/shipping.ts).
export type ParcelSize = "small" | "medium" | "large";

export const PARCEL_LABELS: Record<ParcelSize, string> = {
  small: "Small parcel",
  medium: "Medium parcel",
  large: "Large parcel",
};

// One OEM ref and how many of it a purchase option includes.
export type OptionItem = { ref: string; qty: number };

// A buyable configuration of a product: a single side, a pair, a full set…
// Each option carries its OWN price (explicit bundle pricing — decided
// 2026-06-29). A product with no options is sold as one piece at price_pence.
export type PurchaseOption = {
  key: string; // stable id — "left" | "right" | "pair" | "set-4"
  label: string; // "Left side" / "Pair — both sides" / "Full set ×4 (2 seats)"
  price_pence: number;
  items: OptionItem[]; // OEM refs × quantity included in this option
  slots?: number; // shipping size override for this option (else product slots)
};

export type Product = {
  id: string;
  evo_no: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  // editable status tag shown on the card & product page (e.g. "NLA",
  // "Hard to find", "Cracks with age"). Empty ⇒ no badge. Nothing hardcoded.
  badge?: string | null;
  oem_refs: string[];
  maker: string | null;
  fitted_from: number | null;
  fitted_to: number | null;
  discontinued_year: string | null;
  revived_year: number | null;
  fitment: Fitment[];
  material: string;
  // shipping "slots" this part occupies — summed across the cart at checkout to
  // pick the box tier (small ≤15, medium ≤45, large above). DB default 5.
  slots?: number;
  price_pence: number;
  lead_time_days: number;
  in_stock: boolean;
  used_price_note: string | null;
  story_md: string | null;
  faq: FaqItem[];
  gallery: GalleryImage[];
  // buyable configurations (left/right sides, pair, set). Optional &
  // tolerant of being absent: rows read before the `options` column migration
  // runs come back undefined. Empty/undefined ⇒ sold as a single piece.
  options?: PurchaseOption[];
  created_at?: string;
  // canonical "make-slug|model-slug" per fitment row, maintained by a DB
  // trigger — used to match waiting queue_requests (Phase 2b).
  fitment_keys?: string[];
};

export type QueueRequest = {
  id: string;
  part_label: string;
  make: string | null;
  model: string | null;
  vehicle_key: string | null;
  email: string;
  notified_at: string | null;
  created_at: string;
};

export const formatPrice = (pence: number) =>
  `£${(pence / 100) % 1 === 0 ? pence / 100 : (pence / 100).toFixed(2)}`;

export const normalizeRef = (s: string) =>
  s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/* ---------- purchase-option helpers ---------- */

// distinct OEM refs across all options, first-seen order; falls back to the
// flat oem_refs array when a product has no options (single-ref product).
export const optionRefs = (p: Product): string[] => {
  const out: string[] = [];
  for (const o of p.options ?? [])
    for (const it of o.items)
      if (it.ref && !out.includes(it.ref)) out.push(it.ref);
  return out.length ? out : p.oem_refs;
};

// ref → side label, inferred from single-piece options (exactly one ref, qty 1),
// e.g. "928.521.147.02" → "Left side". Used for the "Replaces" box and SEO.
export const refLabels = (p: Product): Record<string, string> => {
  const m: Record<string, string> = {};
  for (const o of p.options ?? [])
    if (o.items.length === 1 && o.items[0].qty === 1 && o.items[0].ref)
      m[o.items[0].ref] = o.label;
  return m;
};

// lowest option price (for "from £X"); falls back to the base price.
export const startingPrice = (p: Product): number =>
  (p.options ?? []).reduce(
    (min, o) => (o.price_pence > 0 && o.price_pence < min ? o.price_pence : min),
    p.price_pence,
  );
