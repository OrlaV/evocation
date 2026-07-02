-- ============================================================
-- 019 — Tighten client-side INSERT policies (2026-07-02)
-- Security audit finding: the `authenticated` INSERT policies only checked
-- user_id = auth.uid(), so a signed-in user could bypass the server actions
-- with the anon key + their own JWT and write arbitrary column values.
-- Worst case: reviews — insert status='approved' + verified_buyer=true and
-- publish a fake "verified buyer" review on any product, skipping moderation
-- and the bought-it check entirely.
--
--  * reviews / return_requests: ONLY written via server actions using the
--    service role → drop the authenticated INSERT policies altogether.
--  * queue_requests / donor_offers: written via the user's session client
--    (lib/queue-actions.ts) → keep the policies but pin email to the session
--    and (for the queue) pin kind to 'request' ('order_intent' rows are
--    service-role only, written by /api/queue).
-- Idempotent. Apply in the Supabase SQL Editor after 018.
-- ============================================================

-- reviews: service-role writes only (app/actions/reviews.ts enforces the
-- verified-buyer gate, forces status='pending' and sets the author name).
drop policy if exists "users create own review" on public.reviews;

-- return_requests: service-role writes only (app/account/actions.ts verifies
-- the order belongs to the requester before inserting).
drop policy if exists "users create own returns" on public.return_requests;

-- queue_requests: requests/votes come from the session client — pin every
-- client-controllable sensitive column.
drop policy if exists "users insert own queue rows" on public.queue_requests;
create policy "users insert own queue rows"
  on public.queue_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and email = auth.email()
    and kind = 'request'
  );

-- donor_offers: same — the row must carry the session's own identity.
drop policy if exists "users insert own donor offers" on public.donor_offers;
create policy "users insert own donor offers"
  on public.donor_offers for insert to authenticated
  with check (
    user_id = auth.uid()
    and email = auth.email()
    and status = 'new'
  );
