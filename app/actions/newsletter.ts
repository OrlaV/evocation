"use server";

import { createServiceClient } from "@/lib/supabase-server";
import { hasSupabase } from "@/lib/supabase";

export type NewsletterResult = { ok: boolean; msg: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Capture a "notify me about new revivals" email from a visitor who isn't
   buying today. Written with the service role (RLS on newsletter_signups is
   fully locked). Deduped on email — signing up twice is a friendly no-op. */
export async function subscribeNewsletterAction(
  email: string,
  source = "footer",
): Promise<NewsletterResult> {
  const clean = (email ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(clean)) {
    return { ok: false, msg: "Enter a valid email." };
  }
  if (!hasSupabase()) {
    // no DB configured yet — accept gracefully so the UI still confirms
    return { ok: true, msg: "You're on the list." };
  }
  const svc = createServiceClient();
  const { error } = await svc
    .from("newsletter_signups")
    .upsert({ email: clean, source }, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("newsletter signup:", error.message);
    return { ok: false, msg: "Couldn't sign you up — try again." };
  }
  return { ok: true, msg: "You're on the list — we'll email new revivals." };
}
