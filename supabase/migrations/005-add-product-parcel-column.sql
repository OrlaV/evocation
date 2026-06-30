-- 005 — Add Royal Mail parcel size to products (2026-06-29)
-- Drives shipping cost at checkout (small / medium / large). Per-option overrides
-- live inside the options jsonb. Existing rows default to 'small'.
-- Idempotent. Run once in the Supabase SQL Editor.

alter table public.products
  add column if not exists parcel text not null default 'small';

notify pgrst, 'reload schema';
