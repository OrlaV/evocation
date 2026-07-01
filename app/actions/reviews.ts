"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/customer-auth";
import { createServiceClient } from "@/lib/supabase-server";

const PAID_STATES = ["paid", "printed", "shipped", "refunded"];

/* Submit a review. Verified-buyer only: the customer must have an order that
   contains the product. Stored as `pending` for admin moderation. One review
   per customer per product (upsert). */
export async function createReviewAction(input: {
  productId: string;
  slug: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<{ ok: boolean; error?: string; message?: string }> {
  const user = await requireUser();
  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) {
    return { ok: false, error: "Pick a rating from 1 to 5." };
  }
  const svc = createServiceClient();

  // verified-buyer check: any of this account's paid orders includes the part.
  // Two parameterised .eq queries (by account id, and by account email for
  // guest checkouts) — no raw filter string, so no PostgREST filter injection.
  const [byId, byEmail] = await Promise.all([
    svc.from("orders").select("items, status").eq("user_id", user.id),
    user.email
      ? svc.from("orders").select("items, status").eq("email", user.email)
      : Promise.resolve({ data: [] as { items: unknown; status: string }[] }),
  ]);
  const orders = [...(byId.data ?? []), ...(byEmail.data ?? [])];
  const bought = orders.some(
    (o) =>
      PAID_STATES.includes(o.status) &&
      Array.isArray(o.items) &&
      o.items.some(
        (it: { product_id?: string }) => it?.product_id === input.productId,
      ),
  );
  if (!bought) {
    return {
      ok: false,
      error: "Only verified buyers can review — we couldn't find this part in your orders.",
    };
  }

  // display name from the profile, else a neutral label
  const { data: prof } = await svc
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const authorName =
    (typeof prof?.full_name === "string" && prof.full_name.trim()) ||
    "Verified owner";

  const clean = (v: unknown, n: number) =>
    typeof v === "string" ? v.trim().slice(0, n) : null;

  const { error } = await svc.from("reviews").upsert(
    {
      product_id: input.productId,
      user_id: user.id,
      author_name: authorName,
      rating,
      title: clean(input.title, 120),
      body: clean(input.body, 2000),
      status: "pending",
      verified_buyer: true,
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/parts/${input.slug}`);
  return {
    ok: true,
    message: "Thanks — your review is in and will appear once we've checked it.",
  };
}
