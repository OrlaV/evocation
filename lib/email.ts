/* Transactional email via Resend — wired but inert until configured.
   Needs RESEND_API_KEY and RESEND_FROM (a verified sending domain).
   RESEND_FROM is the no-reply sender (noreply@evocation.store) — every
   outbound email is either transactional or an internal notification, so
   nothing should ever be sent from the contact@/support@ inboxes; those only
   receive (contact-form routing lives in lib/contact-topics.ts).
   Uses the REST API directly so we don't add a dependency. */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};
export type SendResult = { ok: true; id?: string } | { ok: false; reason: string };

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

/* Escape user-supplied text before interpolating it into an email's HTML —
   a customer's free-text field must never inject markup into an admin inbox. */
export function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendArgs): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const rawFrom = process.env.RESEND_FROM;
  // show a friendly sender name when RESEND_FROM is a bare address
  const from =
    rawFrom && !rawFrom.includes("<") ? `Evocation <${rawFrom}>` : rawFrom;
  if (!key || !from) {
    return {
      ok: false,
      reason:
        "Resend not configured — set RESEND_API_KEY and RESEND_FROM and verify the sending domain.",
    };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, reason: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, reason: `Resend request failed: ${(e as Error).message}` };
  }
}
