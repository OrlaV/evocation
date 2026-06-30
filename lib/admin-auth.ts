import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient, createServiceClient } from "./supabase-server";
import { hasSupabase } from "./supabase";

/* Admin identity lives in the DB (`admins` table, 2026-06-30). ADMIN_EMAILS is
   kept as a break-glass fallback so a missing/misconfigured table can't lock
   everyone out. is_admin() (security definer) backs RLS on other tables. */

const envAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  // break-glass: env allowlist always wins
  if (envAdminEmails().includes((user.email ?? "").toLowerCase())) return true;
  // source of truth: the admins table (read via service role)
  if (!hasSupabase()) return false;
  try {
    const svc = createServiceClient();
    const { data } = await svc
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

async function currentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/* Garde des pages /admin : session valide + admin (table ou filet env). */
export async function requireAdmin() {
  const user = await currentUser();
  if (!(await isAdmin(user))) redirect("/admin/login");
  return user!;
}

export async function getAdminUser() {
  const user = await currentUser();
  return (await isAdmin(user)) ? user : null;
}
