import { createServiceClient } from "./supabase-server";
import { hasSupabase } from "./supabase";
import { DEFAULT_SHIPPING, DEFAULT_SLOTS, type ShippingSettings } from "./shipping";

/* Adjustable business settings, stored as a single jsonb row in app_settings.
   Read server-side only (service role); always merged over code defaults so a
   missing/partial row never breaks the site. Secrets stay in env, not here. */
export type Settings = {
  shipping: ShippingSettings;
  defaultSlots: number;
};

export const DEFAULT_SETTINGS: Settings = {
  shipping: DEFAULT_SHIPPING,
  defaultSlots: DEFAULT_SLOTS,
};

export async function getSettings(): Promise<Settings> {
  if (!hasSupabase()) return DEFAULT_SETTINGS;
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("id", 1)
      .maybeSingle();
    const v = (data?.value ?? {}) as Partial<Settings>;
    return {
      shipping: {
        zones: v.shipping?.zones ?? DEFAULT_SHIPPING.zones,
        thresholds: v.shipping?.thresholds ?? DEFAULT_SHIPPING.thresholds,
      },
      defaultSlots:
        typeof v.defaultSlots === "number" && v.defaultSlots > 0
          ? v.defaultSlots
          : DEFAULT_SLOTS,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
