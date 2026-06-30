/* Transactional email via Resend — wired but inert until configured.
   Needs RESEND_API_KEY and RESEND_FROM (a verified sending domain).
   Uses the REST API directly so we don't add a dependency. */

type SendArgs = { to: string; subject: string; html: string; text?: string };
export type SendResult = { ok: true; id?: string } | { ok: false; reason: string };

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendArgs): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
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
      body: JSON.stringify({ from, to, subject, html, text }),
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
