import { SEED_PRODUCTS } from "./seed";
import { hasSupabase } from "./supabase";
import { createServiceClient } from "./supabase-server";

/* All homepage stats reflect the DB (2026-06-30): "in the queue" is the number
   of distinct parts people have actually requested/voted for — no curated
   baseline. */

export type HomeStats = {
  revived: number;
  inQueue: number;
  leadDays: number;
};

export async function getHomeStats(): Promise<HomeStats> {
  if (!hasSupabase()) {
    return {
      revived: SEED_PRODUCTS.length,
      inQueue: 0,
      leadDays: Math.min(...SEED_PRODUCTS.map((p) => p.lead_time_days)),
    };
  }
  const supabase = createServiceClient();
  const [productsRes, queueRes] = await Promise.all([
    supabase
      .from("products")
      .select("lead_time_days")
      .eq("status", "published"),
    supabase
      .from("queue_requests")
      .select("part_label, request_key")
      .neq("kind", "order_intent"),
  ]);

  const distinctParts = new Set(
    (queueRes.data ?? []).map(
      (r) => r.request_key ?? r.part_label.toLowerCase().trim(),
    ),
  );
  const leads = (productsRes.data ?? []).map((p) => p.lead_time_days);

  return {
    revived: productsRes.data?.length ?? 0,
    inQueue: distinctParts.size,
    leadDays: leads.length ? Math.min(...leads) : 5,
  };
}
