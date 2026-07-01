import type Stripe from "stripe";
import { PARCEL_LABELS, type ParcelSize } from "./types";

/* Royal Mail shipping. Rates & slot thresholds are ADJUSTABLE from /admin
   (stored in app_settings); the values here are the defaults / fallback. The
   country lists per zone stay in code (they rarely change). Prices in pence,
   VAT-INCLUSIVE. */

export type ShipZone = "uk" | "eu" | "world";
export type ZoneRates = Record<ParcelSize, number>;

export type ZoneConfig = {
  key: ShipZone;
  label: string; // shown in the region selector
  carrier: string;
  rates: ZoneRates;
  estimate: [number, number]; // business days [min, max]
};

export type SlotThresholds = {
  small: number; // cart total ≤ this → small parcel
  medium: number; // ≤ this → medium parcel
  large: number; // capacity of one large box; above → multiple large boxes
};

export type ShippingSettings = {
  zones: ZoneConfig[];
  thresholds: SlotThresholds;
};

export const DEFAULT_SLOTS = 5; // default shipping slots for a new part

export const DEFAULT_SHIPPING: ShippingSettings = {
  zones: [
    {
      key: "uk",
      label: "United Kingdom",
      carrier: "Royal Mail Tracked",
      rates: { small: 365, medium: 555, large: 1195 },
      estimate: [2, 4],
    },
    {
      // Priced HIGH on purpose (conservative) — Royal Mail Int'l Tracked to the
      // dearest EU zone is ~£22.40 at 2kg (Apr-2025 tariff); the large tier
      // covers heavier/bulky boxes that fall to Int'l Standard. Better to
      // slightly over-quote than lose margin on export. Adjustable in /admin.
      key: "eu",
      label: "Europe",
      carrier: "Royal Mail Int'l Tracked",
      rates: { small: 1485, medium: 2240, large: 3495 },
      estimate: [3, 7],
    },
    {
      // Rest of world — Int'l Tracked to the dearest world zones runs well above
      // the EU rates at 2kg; kept deliberately high to stay safe worldwide.
      key: "world",
      label: "Rest of world",
      carrier: "Royal Mail Int'l Tracked",
      rates: { small: 2095, medium: 3295, large: 4995 },
      estimate: [5, 12],
    },
  ],
  thresholds: { small: 15, medium: 45, large: 135 },
};

/* ---------- country lists (in code; the zone KEYS are fixed) ---------- */
type AllowedCountry =
  Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;

const ZONE_COUNTRIES: Record<ShipZone, AllowedCountry[]> = {
  uk: ["GB"],
  eu: [
    "IE", "FR", "DE", "NL", "BE", "LU", "ES", "PT", "IT", "AT", "CH", "DK",
    "SE", "NO", "FI", "IS", "PL", "CZ", "SK", "HU", "SI", "HR", "GR", "RO",
    "BG", "EE", "LV", "LT", "CY", "MT", "LI",
  ],
  world: [
    "US", "CA", "AU", "NZ", "JP", "SG", "HK", "AE", "ZA", "KR", "MY", "TH",
    "BR", "MX", "IN", "IL", "SA", "QA", "KW", "TR", "CL", "AR",
  ],
};

/** Every country we ship to (union of all zones) so a buyer is never blocked. */
export const ALL_COUNTRIES: AllowedCountry[] = Array.from(
  new Set(Object.values(ZONE_COUNTRIES).flat()),
);

/* ---------- packing & pricing ---------- */
export type PackItem = { slots: number; qty: number };

const zoneConfig = (s: ShippingSettings, zone: ShipZone): ZoneConfig =>
  s.zones.find((z) => z.key === zone) ?? s.zones[0];

/** Box tier + box count for a cart, from its total slots and the thresholds. */
export function packCart(
  items: PackItem[],
  t: SlotThresholds,
): { tier: ParcelSize; boxes: number; total: number } {
  const total = items.reduce(
    (n, it) => n + Math.max(0, it.slots || 0) * Math.max(1, it.qty),
    0,
  );
  if (total <= t.small) return { tier: "small", boxes: 1, total };
  if (total <= t.medium) return { tier: "medium", boxes: 1, total };
  if (total <= t.large) return { tier: "large", boxes: 1, total };
  return { tier: "large", boxes: Math.ceil(total / Math.max(1, t.large)), total };
}

/** Total shipping (pence, VAT-inclusive) for a packed cart in a region. */
export function shippingPenceForCart(
  s: ShippingSettings,
  zone: ShipZone,
  items: PackItem[],
): number {
  const { tier, boxes } = packCart(items, s.thresholds);
  return zoneConfig(s, zone).rates[tier] * boxes;
}

/** Stripe shipping options for a packed cart — one per zone, priced for the
    chosen box tier × box count. */
export function shippingOptionsForCart(
  s: ShippingSettings,
  items: PackItem[],
): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const { tier, boxes } = packCart(items, s.thresholds);
  return s.zones.map((z) => ({
    shipping_rate_data: {
      display_name: `${z.label} · ${z.carrier} · ${boxes > 1 ? `${boxes}× ` : ""}${PARCEL_LABELS[tier]}`,
      type: "fixed_amount",
      fixed_amount: { amount: z.rates[tier] * boxes, currency: "gbp" },
      tax_behavior: "inclusive",
      tax_code: "txcd_92010001", // shipping
      delivery_estimate: {
        minimum: { unit: "business_day", value: z.estimate[0] },
        maximum: { unit: "business_day", value: z.estimate[1] },
      },
    },
  }));
}
