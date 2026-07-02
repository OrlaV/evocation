-- ============================================================
-- 022 — Contact message topic (2026-07-02)
-- The contact form now asks what the message is about (order chasing,
-- fitment, part revival, press, other — see lib/contact-topics.ts). Stored
-- alongside the message so the inbox routing decision stays auditable.
-- Idempotent. Apply after 021, BEFORE deploying the contact-topic code.
-- ============================================================

alter table public.contact_messages
  add column if not exists topic text;
