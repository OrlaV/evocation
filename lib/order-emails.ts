import { formatPrice } from "./types";
import { SITE_URL } from "./site";

/* Transactional order emails (confirmation / shipped / refunded), built from a
   stored order row so the webhook and the admin actions share one source. */

export type OrderItem = { name?: string | null; qty?: number | null };
export type OrderForEmail = {
  order_no?: number | null;
  amount_pence?: number | null;
  items?: OrderItem[] | null;
  tracking_number?: string | null;
};

export type Email = { subject: string; html: string; text: string };

export const orderNoLabel = (n?: number | null) =>
  n ? `O-${String(n).padStart(4, "0")}` : "your order";

export const royalMailTrackingUrl = (n: string) =>
  `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(
    n.trim(),
  )}`;

const itemLines = (items?: OrderItem[] | null) =>
  (items ?? []).map((i) => `${i.qty ?? 1}× ${i.name ?? "Part"}`);

const shell = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#23272b">
    <p style="font:600 11px/1 monospace;letter-spacing:.18em;color:#d8261d;text-transform:uppercase">Evocation</p>
    ${body}
    <p style="font-size:12px;color:#8a8f92;margin-top:26px">Evocation — discontinued parts, revived. Printed to order in the UK · fits or refunded.</p>
  </div>`;

export function orderConfirmationEmail(o: OrderForEmail): Email {
  const total = formatPrice(o.amount_pence ?? 0);
  const lines = itemLines(o.items);
  return {
    subject: `Evocation — order ${orderNoLabel(o.order_no)} confirmed (${total})`,
    html: shell(
      `<h1 style="font-size:22px;margin:12px 0">Order confirmed</h1>
       <p style="font-size:15px;line-height:1.5;color:#5b6166">Thank you — ${orderNoLabel(o.order_no)} is confirmed. Each part is printed to order and finished by hand; we'll email tracking the moment it ships.</p>
       <p style="font-size:15px;line-height:1.6">${lines.join("<br>")}</p>
       <p style="font-size:15px"><strong>Total paid: ${total}</strong></p>`,
    ),
    text: `Order ${orderNoLabel(o.order_no)} confirmed.\n\n${lines.join(
      "\n",
    )}\n\nTotal paid: ${total}\n\n— Evocation`,
  };
}

export function orderShippedEmail(o: OrderForEmail): Email {
  const tracking = (o.tracking_number ?? "").trim();
  const lines = itemLines(o.items);
  const trackBlock = tracking
    ? `<p style="margin:18px 0">
         <span style="font:600 12px/1 monospace;letter-spacing:.1em;color:#5b6166">ROYAL MAIL TRACKING</span><br>
         <span style="font:700 18px monospace">${tracking}</span>
       </p>
       <p style="margin:18px 0">
         <a href="${royalMailTrackingUrl(tracking)}" style="background:#d8261d;color:#fff;text-decoration:none;font:700 13px Arial;padding:13px 22px;display:inline-block">Track your parcel →</a>
       </p>`
    : "";
  return {
    subject: `Evocation — ${orderNoLabel(o.order_no)} is on its way`,
    html: shell(
      `<h1 style="font-size:22px;margin:12px 0">It's on its way</h1>
       <p style="font-size:15px;line-height:1.5;color:#5b6166">${orderNoLabel(o.order_no)} has shipped by Royal Mail.</p>
       <p style="font-size:15px;line-height:1.6">${lines.join("<br>")}</p>
       ${trackBlock}`,
    ),
    text: `${orderNoLabel(o.order_no)} has shipped by Royal Mail.\n${
      tracking ? `Tracking: ${tracking}\n${royalMailTrackingUrl(tracking)}\n` : ""
    }\n— Evocation`,
  };
}

export function orderRefundedEmail(o: OrderForEmail): Email {
  const total = formatPrice(o.amount_pence ?? 0);
  return {
    subject: `Evocation — ${orderNoLabel(o.order_no)} refunded (${total})`,
    html: shell(
      `<h1 style="font-size:22px;margin:12px 0">Refund issued</h1>
       <p style="font-size:15px;line-height:1.5;color:#5b6166">We've refunded ${total} for ${orderNoLabel(o.order_no)}. It can take a few working days to appear on your statement.</p>
       <p style="font-size:13px;color:#8a8f92"><a href="${SITE_URL}/account" style="color:#d8261d">View your account →</a></p>`,
    ),
    text: `We've refunded ${total} for ${orderNoLabel(o.order_no)}. Allow a few working days.\n\n— Evocation`,
  };
}
