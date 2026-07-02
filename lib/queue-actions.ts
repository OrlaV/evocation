"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase-server";
import { normalizeRef } from "./types";

/* Server actions for the resurrection queue (homepage §04). Requesting,
   voting and donating all require an account (decision 2026-06-30): each
   insert runs through the user's session client so RLS ties the row to
   auth.uid(). The aggregated board is read separately in lib/queue.ts. */

export type ActionResult = { ok: boolean; error?: string; already?: boolean };

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const refOf = (label: string) => {
  const n = normalizeRef(label);
  return n.length >= 5 ? n : null;
};

async function sessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// Request a new part to be revived (account required).
export async function requestPart(input: {
  make?: string;
  model?: string;
  part?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await sessionUser();
  if (!user?.email) return { ok: false, error: "auth" };
  const part = clean(input.part, 200);
  if (!part) return { ok: false, error: "invalid" };

  const { error } = await supabase.from("queue_requests").insert({
    part_label: part,
    ref_normalized: refOf(part),
    make: clean(input.make, 80) || null,
    model: clean(input.model, 80) || null,
    email: user.email,
    user_id: user.id,
    kind: "request",
  });
  if (error && error.code !== "23505") {
    console.error("requestPart:", error.message);
    return { ok: false, error: "db" };
  }
  revalidatePath("/");
  return { ok: true, already: error?.code === "23505" };
}

// Vote for a part already on the board (account required, one per user/part).
export async function votePart(input: {
  key: string;
  label: string;
  make?: string;
  model?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await sessionUser();
  if (!user?.email) return { ok: false, error: "auth" };
  const key = clean(input.key, 200);
  const label = clean(input.label, 200);
  if (!key || !label) return { ok: false, error: "invalid" };

  const { error } = await supabase.from("queue_requests").insert({
    part_label: label,
    request_key: key,
    ref_normalized: refOf(label),
    make: clean(input.make, 80) || null,
    model: clean(input.model, 80) || null,
    email: user.email,
    user_id: user.id,
    kind: "request",
  });
  // 23505 = unique (user_id, request_key) → already voted, treat as success
  if (error && error.code !== "23505") {
    console.error("votePart:", error.message);
    return { ok: false, error: "db" };
  }
  revalidatePath("/");
  return { ok: true, already: error?.code === "23505" };
}

// Offer to lend us an original to scan (account required).
export async function donatePart(input: {
  make?: string;
  model?: string;
  part?: string;
  condition?: string;
  notes?: string;
  /* donor wall consent — OPT IN: only when the donor ticks the box do we
     store a display name; the default is an anonymous credit. */
  displayConsent?: boolean;
  publicName?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await sessionUser();
  if (!user?.email) return { ok: false, error: "auth" };
  const part = clean(input.part, 200);
  if (!part) return { ok: false, error: "invalid" };

  const publicName = clean(input.publicName, 80);
  const displayConsent = input.displayConsent === true && Boolean(publicName);

  const { error } = await supabase.from("donor_offers").insert({
    part_label: part,
    ref_normalized: refOf(part),
    make: clean(input.make, 80) || null,
    model: clean(input.model, 80) || null,
    condition: clean(input.condition, 120) || null,
    notes: clean(input.notes, 1000) || null,
    email: user.email,
    user_id: user.id,
    display_consent: displayConsent,
    public_name: displayConsent ? publicName : null,
  });
  if (error) {
    console.error("donatePart:", error.message);
    return { ok: false, error: "db" };
  }
  revalidatePath("/");
  return { ok: true };
}
