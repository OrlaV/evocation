"use server";

import { createServiceClient } from "@/lib/supabase-server";
import { hasSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/customer-auth";
import { sendEmail, emailConfigured, escapeHtml } from "@/lib/email";
import { CONTACT_EMAIL } from "@/lib/site";

export type ContactResult = { ok: boolean; msg: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Contact form submission (homepage §06 + /contact). The message is stored in
   contact_messages (service role — RLS fully locked) and forwarded to the
   public inbox with Reply-To set to the sender, so answering is one click.
   Storage is the source of truth: a failed notification email is logged but
   doesn't fail the submission. */
export async function submitContactAction(input: {
  name: string;
  email: string;
  message: string;
  /* honeypot — hidden from humans; bots that fill it get a fake success */
  company?: string;
}): Promise<ContactResult> {
  if (input.company) {
    return { ok: true, msg: "Thanks — we'll get back to you within a working day." };
  }

  const name = (input.name ?? "").trim().slice(0, 120);
  const email = (input.email ?? "").trim().toLowerCase().slice(0, 200);
  const message = (input.message ?? "").trim().slice(0, 4000);

  if (!name) return { ok: false, msg: "Tell us your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, msg: "Enter a valid email." };
  if (message.length < 10) {
    return { ok: false, msg: "Tell us a little more — a sentence or two helps." };
  }

  let stored = false;
  if (hasSupabase()) {
    const user = await getUser();
    const { error } = await createServiceClient()
      .from("contact_messages")
      .insert({ name, email, message, source: "site", user_id: user?.id ?? null });
    if (error) console.error("contact message insert:", error.message);
    else stored = true;
  }

  if (emailConfigured()) {
    const sent = await sendEmail({
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact form — ${name}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt; wrote:</p>
             <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      text: `${name} <${email}> wrote:\n\n${message}`,
    });
    if (!sent.ok) console.error("contact notification:", sent.reason);
    else stored = true;
  }

  if (!stored) {
    return { ok: false, msg: "Couldn't send your message — email us directly instead." };
  }
  return { ok: true, msg: "Thanks — we'll get back to you within a working day." };
}
