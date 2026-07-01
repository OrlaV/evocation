import { createAnonClient, hasSupabase } from "./supabase";

export type Review = {
  id: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  verified_buyer: boolean;
  created_at: string;
};

export type ReviewSummary = {
  reviews: Review[];
  count: number;
  average: number; // 0 when none
};

/* Approved reviews for a product (RLS lets the anon client read only approved
   rows). Safe before Supabase is configured — returns an empty summary. */
export async function getProductReviews(
  productId: string,
): Promise<ReviewSummary> {
  const empty: ReviewSummary = { reviews: [], count: 0, average: 0 };
  if (!hasSupabase()) return empty;
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, title, body, verified_buyer, created_at")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getProductReviews:", error.message);
    return empty;
  }
  const reviews = (data as Review[]) ?? [];
  const count = reviews.length;
  const average = count
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : 0;
  return { reviews, count, average };
}
