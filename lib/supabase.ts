import { createClient } from "@supabase/supabase-js";

export const hasSupabase = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

/* Anonymous client — public reads (RLS: published products only)
   and queue inserts. Admin writes will use the service role key
   server-side (Phase 2, /admin). */
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
