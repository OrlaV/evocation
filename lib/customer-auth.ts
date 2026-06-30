import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/account/login");
  return user;
}
