"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/* Toggle a product in the signed-in customer's wishlist. Uses the SESSION
   client so RLS ("users manage own wishlist") enforces ownership at the DB —
   no service-role bypass needed. */
export async function toggleWishlistAction(
  productId: string,
  slug?: string,
): Promise<{ ok: boolean; saved: boolean; error?: string }> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("product_id", productId);
    if (error) return { ok: false, saved: true, error: error.message };
    if (slug) revalidatePath(`/parts/${slug}`);
    revalidatePath("/account");
    return { ok: true, saved: false };
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ product_id: productId, user_id: user.id });
  if (error && error.code !== "23505") {
    return { ok: false, saved: false, error: error.message };
  }
  if (slug) revalidatePath(`/parts/${slug}`);
  revalidatePath("/account");
  return { ok: true, saved: true };
}
