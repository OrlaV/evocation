import type { Product } from "./types";
import { normalizeRef, optionRefs } from "./types";
import { getPublishedProducts } from "./products";
import { hasSupabase } from "./supabase";
import { createServiceClient } from "./supabase-server";
import { QUEUE_STAGES, type QueueStage } from "./queue-stages";

/* The reference registry (chantier G): one page per OEM part number the site
   knows about — revived (a product replaces it), queued (owners are voting),
   or unknown. Built from data we already have; every ref someone requests in
   the queue automatically becomes an indexable landing page, so demand keeps
   growing the registry's search surface on its own. */

export type RefEntry = {
  ref: string; // normalized (URL segment)
  display: string; // as printed on the part / typed by owners
  status: "revived" | "queued";
  /* revived */
  product?: { slug: string; name: string; evo_no: string };
  /* queued */
  label?: string;
  count?: number;
  stage?: QueueStage;
  vehicle: string | null;
};

const productVehicle = (p: Product): string | null => {
  const f = p.fitment?.[0];
  return f ? [f.make, f.model].filter(Boolean).join(" ") : null;
};

type QueueRefRow = {
  ref_normalized: string | null;
  request_key: string | null;
  part_label: string;
  make: string | null;
  model: string | null;
  email: string | null;
  user_id: string | null;
};

/* Queue rows that carry a recognisable ref, grouped by that ref. */
async function queueRefGroups(): Promise<Map<string, QueueRefRow[]>> {
  const groups = new Map<string, QueueRefRow[]>();
  if (!hasSupabase()) return groups;
  const { data, error } = await createServiceClient()
    .from("queue_requests")
    .select("ref_normalized, request_key, part_label, make, model, email, user_id")
    .neq("kind", "order_intent")
    .not("ref_normalized", "is", null);
  if (error) {
    console.error("queueRefGroups:", error.message);
    return groups;
  }
  for (const r of (data as QueueRefRow[]) ?? []) {
    const key = r.ref_normalized!;
    const g = groups.get(key);
    if (g) g.push(r);
    else groups.set(key, [r]);
  }
  return groups;
}

/* Furthest workshop stage across the request_keys behind a ref. */
async function stageForKeys(keys: string[]): Promise<QueueStage> {
  if (!hasSupabase() || keys.length === 0) return "queued";
  const { data } = await createServiceClient()
    .from("queue_stages")
    .select("request_key, stage")
    .in("request_key", keys);
  let best = 0;
  for (const s of data ?? []) {
    const i = (QUEUE_STAGES as readonly string[]).indexOf(s.stage as string);
    if (i > best) best = i;
  }
  return QUEUE_STAGES[best];
}

const queueEntryFrom = (
  ref: string,
  rows: QueueRefRow[],
  stage: QueueStage,
): RefEntry => {
  const supporters = new Set(
    rows.map((r) => r.user_id ?? r.email?.toLowerCase() ?? "").filter(Boolean),
  );
  const withVehicle = rows.find((r) => r.make);
  return {
    ref,
    display: rows[0].part_label,
    status: "queued",
    label: rows[0].part_label,
    count: supporters.size,
    stage,
    vehicle: withVehicle
      ? [withVehicle.make, withVehicle.model].filter(Boolean).join(" ")
      : null,
  };
};

/* Every reference the registry knows: revived product refs first, then queue
   refs not already covered by a product. Drives /ref, the sitemap and
   generateStaticParams. */
export async function getKnownRefs(): Promise<RefEntry[]> {
  const [products, queueGroups] = await Promise.all([
    getPublishedProducts(),
    queueRefGroups(),
  ]);

  const out: RefEntry[] = [];
  const seen = new Set<string>();

  for (const p of products) {
    for (const display of optionRefs(p)) {
      const ref = normalizeRef(display);
      if (!ref || seen.has(ref)) continue;
      seen.add(ref);
      out.push({
        ref,
        display,
        status: "revived",
        product: { slug: p.slug, name: p.name, evo_no: p.evo_no },
        vehicle: productVehicle(p),
      });
    }
  }

  const queued = [...queueGroups.entries()].filter(([ref]) => !seen.has(ref));
  if (queued.length) {
    // one stage lookup for all queued refs
    const stageMap = new Map<string, QueueStage>();
    if (hasSupabase()) {
      const { data } = await createServiceClient()
        .from("queue_stages")
        .select("request_key, stage");
      for (const s of data ?? []) {
        if ((QUEUE_STAGES as readonly string[]).includes(s.stage as string)) {
          stageMap.set(s.request_key as string, s.stage as QueueStage);
        }
      }
    }
    for (const [ref, rows] of queued) {
      let best = 0;
      for (const r of rows) {
        const st = r.request_key ? stageMap.get(r.request_key) : undefined;
        const i = st ? (QUEUE_STAGES as readonly string[]).indexOf(st) : 0;
        if (i > best) best = i;
      }
      out.push(queueEntryFrom(ref, rows, QUEUE_STAGES[best]));
    }
  }

  return out;
}

/* Status of ONE reference — for /ref/[ref]. Null = unknown to the registry. */
export async function getRefStatus(raw: string): Promise<RefEntry | null> {
  const ref = normalizeRef(raw);
  if (ref.length < 3) return null;

  const products = await getPublishedProducts();
  for (const p of products) {
    for (const display of optionRefs(p)) {
      if (normalizeRef(display) === ref) {
        return {
          ref,
          display,
          status: "revived",
          product: { slug: p.slug, name: p.name, evo_no: p.evo_no },
          vehicle: productVehicle(p),
        };
      }
    }
  }

  if (!hasSupabase()) return null;
  const { data, error } = await createServiceClient()
    .from("queue_requests")
    .select("ref_normalized, request_key, part_label, make, model, email, user_id")
    .neq("kind", "order_intent")
    .eq("ref_normalized", ref);
  if (error) {
    console.error("getRefStatus:", error.message);
    return null;
  }
  const rows = (data as QueueRefRow[]) ?? [];
  if (!rows.length) return null;

  const keys = [
    ...new Set(rows.map((r) => r.request_key).filter((k): k is string => !!k)),
  ];
  return queueEntryFrom(ref, rows, await stageForKeys(keys));
}
