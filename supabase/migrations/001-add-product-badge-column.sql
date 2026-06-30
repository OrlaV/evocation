-- 001 — Add editable status badge to products (2026-06-29)
-- Replaces the hardcoded "NLA" tag on the card & product page with a per-product,
-- editor-controlled value. Idempotent. Run once in the Supabase SQL Editor.

alter table public.products
  add column if not exists badge text default 'NLA';

-- refresh PostgREST's schema cache so the API sees the new column immediately
notify pgrst, 'reload schema';
