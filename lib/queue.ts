import { hasSupabase } from "./supabase";
import { createServiceClient } from "./supabase-server";

/* The resurrection queue (homepage §04) reflects the DB. Requests & votes
   both live in `queue_requests`, grouped by `request_key`; a part's "waiting"
   count is its number of distinct supporters (user_id, falling back to email
   for legacy anonymous rows). Aggregated server-side via the service role so
   no raw emails reach the client and no public read policy is needed. */

export type QueueBoardItem = {
  key: string;
  label: string;
  vehicle: string | null;
  count: number;
};

type Row = {
  request_key: string | null;
  part_label: string;
  make: string | null;
  model: string | null;
  email: string | null;
  user_id: string | null;
  kind: string | null;
  created_at: string;
};

const vehicleLabel = (make: string | null, model: string | null) =>
  make ? (model ? `${make} · ${model}` : make) : null;

export async function getQueueBoard(limit = 6): Promise<QueueBoardItem[]> {
  if (!hasSupabase()) return [];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("queue_requests")
    .select(
      "request_key, part_label, make, model, email, user_id, kind, created_at",
    )
    .neq("kind", "order_intent")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getQueueBoard:", error.message);
    return [];
  }
  const rows = (data as Row[]) ?? [];

  type Agg = {
    key: string;
    supporters: Set<string>;
    vehicle: string | null;
    labels: Map<string, number>;
    latest: string;
  };
  const groups = new Map<string, Agg>();
  for (const r of rows) {
    const key = r.request_key ?? r.part_label.trim().toLowerCase();
    if (!key) continue;
    const supporter = r.user_id ?? r.email?.toLowerCase() ?? "";
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        supporters: new Set(),
        vehicle: vehicleLabel(r.make, r.model),
        labels: new Map(),
        latest: r.created_at,
      };
      groups.set(key, g);
    }
    if (supporter) g.supporters.add(supporter);
    if (!g.vehicle) g.vehicle = vehicleLabel(r.make, r.model);
    if (r.part_label) g.labels.set(r.part_label, (g.labels.get(r.part_label) ?? 0) + 1);
    if (r.created_at > g.latest) g.latest = r.created_at;
  }

  return [...groups.values()]
    .map((g) => ({
      key: g.key,
      // most frequently typed label for the part
      label:
        [...g.labels.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? g.key,
      vehicle: g.vehicle,
      count: g.supporters.size,
      latest: g.latest,
    }))
    .sort((a, b) => b.count - a.count || (a.latest < b.latest ? 1 : -1))
    .slice(0, limit)
    .map(({ key, label, vehicle, count }) => ({ key, label, vehicle, count }));
}

/* request_keys the given user has already backed — drives the "Voted" state. */
export async function getUserVoteKeys(userId: string): Promise<string[]> {
  if (!hasSupabase()) return [];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("queue_requests")
    .select("request_key")
    .eq("user_id", userId);
  if (error) {
    console.error("getUserVoteKeys:", error.message);
    return [];
  }
  return (data ?? [])
    .map((r) => r.request_key as string | null)
    .filter((k): k is string => Boolean(k));
}
