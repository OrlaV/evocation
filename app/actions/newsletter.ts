"use server";

import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase-server";
import { hasSupabase } from "@/lib/supabase";
import { sendEmail, emailConfigured } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export type NewsletterResult = { ok: boolean; msg: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Double opt-in newsletter signup. Stores the address as 'pending' with a token
   and emails a confirmation link; the address only counts once the link is
   clicked (GDPR consent — can't silently enrol someone else). Written with the
   service role (RLS on newsletter_signups is fully locked). */
export async function subscribeNewsletterAction(
  email: string,
  source = "footer",
): Promise<NewsletterResult> {
  const clean = (email ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(clean)) {
    return { ok: false, msg: "Enter a valid email." };
  }
  if (!hasSupabase()) {
    return { ok: true, msg: "You're on the list." };
  }
  const svc = createServiceClient();

  const { data: existing } = await svc
    .from("newsletter_signups")
    .select("status, token")
    .eq("email", clean)
    .maybeSingle();

  if (existing?.status === "confirmed") {
    return { ok: true, msg: "You're already subscribed — thank you." };
  }

  // reuse an existing pending token, else mint one
  const token = (existing?.token as string | undefined) ?? randomUUID();
  const { error } = await svc.from("newsletter_signups").upsert(
    { email: clean, source, status: "pending", token, confirmed_at: null },
    { onConflict: "email" },
  );
  if (error) {
    console.error("newsletter signup:", error.message);
    return { ok: false, msg: "Couldn't sign you up — try again." };
  }

  if (emailConfigured()) {
    const url = `${SITE_URL}/newsletter/confirm?token=${token}`;
    await sendEmail({
      to: clean,
      subject: "Confirm your Evocation subscription",
      html: `<p>Confirm you want emails about new revivals from Evocation.</p>
             <p><a href="${url}" style="background:#d8261d;color:#fff;text-decoration:none;font:700 13px Arial;padding:12px 20px;display:inline-block">Confirm subscription →</a></p>
             <p style="font-size:12px;color:#8a8f92">If you didn't request this, ignore this email — you won't be added.</p>`,
      text: `Confirm your Evocation subscription: ${url}\n\nIf you didn't request this, ignore this email.`,
    });
    return { ok: true, msg: "Almost there — check your inbox to confirm." };
  }

  // email not configured: keep the pending row, tell the truth
  return { ok: true, msg: "You're on the list." };
}
