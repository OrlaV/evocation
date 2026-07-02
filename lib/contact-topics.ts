import { CONTACT_EMAIL, SUPPORT_EMAIL } from "./site";

/* Contact form topics (homepage §06 + /contact). One list drives the client
   <select>, server-side validation and inbox routing, so they can't drift.
   Routing: order chasing goes to the after-sales inbox (support@), everything
   else to the general one (contact@). Sending stays noreply@ (RESEND_FROM) —
   these addresses are only where the notification lands. */
export const CONTACT_TOPICS = [
  { value: "order", label: "An order I've placed", to: SUPPORT_EMAIL },
  { value: "fitment", label: "Fitment & compatibility", to: CONTACT_EMAIL },
  { value: "revival", label: "Request a part revival", to: CONTACT_EMAIL },
  { value: "press", label: "Press & partnerships", to: CONTACT_EMAIL },
  { value: "other", label: "Something else", to: CONTACT_EMAIL },
] as const;

export type ContactTopicValue = (typeof CONTACT_TOPICS)[number]["value"];

/* Tolerant lookup — an unknown/missing value (stale client, bot) falls back to
   "other" rather than failing the submission. */
export function resolveContactTopic(value: unknown) {
  return (
    CONTACT_TOPICS.find((t) => t.value === value) ??
    CONTACT_TOPICS[CONTACT_TOPICS.length - 1]
  );
}
