import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import ReviewsAdmin, { type AdminReview } from "@/components/admin/ReviewsAdmin";

export const metadata: Metadata = {
  title: "Reviews — Evocation admin",
  robots: { index: false },
};

type Row = {
  id: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  verified_buyer: boolean;
  created_at: string;
  products: { name: string; slug: string } | null;
};

export default async function AdminReviewsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, author_name, rating, title, body, status, verified_buyer, created_at, products(name, slug)",
    )
    .order("created_at", { ascending: false });
  const rows = (data as Row[] | null) ?? [];
  const reviews: AdminReview[] = rows.map((r) => ({
    id: r.id,
    slug: r.products?.slug ?? "",
    product_name: r.products?.name ?? "—",
    author_name: r.author_name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status,
    verified_buyer: r.verified_buyer,
    created_at: r.created_at,
  }));
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[860px]">
        <a
          href="/admin"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to registry admin
        </a>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label-mono !tracking-[0.18em] text-brg">Workshop</div>
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">Reviews</h1>
          </div>
          <div className="label-mono !text-[0.7rem] text-ink-soft">
            {reviews.length} total · {pending} pending
          </div>
        </div>
        <ReviewsAdmin reviews={reviews} />
      </div>
    </main>
  );
}
