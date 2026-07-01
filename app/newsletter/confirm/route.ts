import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { hasSupabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/* Target of the double opt-in confirmation link. Flips the matching pending
   signup to 'confirmed', then redirects to a thank-you page. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const done = (ok: boolean) =>
    NextResponse.redirect(new URL(`/newsletter/confirmed?ok=${ok ? 1 : 0}`, SITE_URL));

  // basic UUID shape check before hitting the DB
  if (!/^[0-9a-f-]{36}$/i.test(token) || !hasSupabase()) return done(false);

  try {
    const svc = createServiceClient();
    const { data, error } = await svc
      .from("newsletter_signups")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("token", token)
      .select("id")
      .maybeSingle();
    return done(!error && !!data);
  } catch {
    return done(false);
  }
}
