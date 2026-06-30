import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { createServiceClient } from "@/lib/supabase-server";
import { normalizeRef } from "@/lib/types";

/* naive per-instance rate limit — enough until real traffic */
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const part = typeof body.part === "string" ? body.part.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const make = typeof body.make === "string" ? body.make.trim() : "";
  const model = typeof body.model === "string" ? body.model.trim() : "";
  const honeypot = typeof body.company === "string" ? body.company : "";

  // bots fill the hidden field — pretend success, store nothing
  if (honeypot) return NextResponse.json({ ok: true });

  if (!part || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }

  // sans projet Supabase configuré, on accepte sans stocker (dev)
  if (!hasSupabase()) return NextResponse.json({ ok: true, stored: false });

  // product-page purchase intent (NotifyMe). Written server-side via the
  // service role — queue_requests is otherwise authenticated-only — and tagged
  // 'order_intent' so it never shows on the resurrection board.
  const supabase = createServiceClient();
  const normalized = normalizeRef(part);
  const { error } = await supabase.from("queue_requests").insert({
    part_label: part.slice(0, 200),
    ref_normalized: normalized.length >= 5 ? normalized : null,
    make: make ? make.slice(0, 80) : null,
    model: model ? model.slice(0, 80) : null,
    email: email.slice(0, 200),
    kind: "order_intent",
  });

  if (error) {
    console.error("queue insert:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
