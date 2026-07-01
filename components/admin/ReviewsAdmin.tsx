"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateReviewAction } from "@/app/admin/actions";

export type AdminReview = {
  id: string;
  slug: string;
  product_name: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  verified_buyer: boolean;
  created_at: string;
};

function Card({ r }: { r: AdminReview }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const set = (status: "approved" | "rejected" | "pending") =>
    start(async () => {
      setMsg(null);
      const res = await moderateReviewAction({ id: r.id, slug: r.slug, status });
      setMsg(res.msg);
      if (res.ok) router.refresh();
    });

  return (
    <div className="border border-hairline p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="tracking-[0.1em] text-brg">
            {"★".repeat(r.rating)}
            <span className="text-ink-soft/40">{"★".repeat(5 - r.rating)}</span>
          </span>
          {r.verified_buyer && (
            <span className="label-mono !text-[0.56rem] text-brass">
              Verified buyer
            </span>
          )}
          <span
            className={`label-mono border px-2 py-[1px] !text-[0.58rem] ${
              r.status === "approved"
                ? "border-brass text-brass"
                : r.status === "rejected"
                  ? "border-ink-soft text-ink-soft line-through"
                  : "border-brg text-brg"
            }`}
          >
            {r.status}
          </span>
        </div>
        <span className="label-mono !text-[0.6rem] text-ink-soft">
          {r.product_name} · {new Date(r.created_at).toLocaleDateString("en-GB")}
        </span>
      </div>
      {r.title && <div className="mt-2 font-display font-bold">{r.title}</div>}
      {r.body && <p className="mt-1 text-[0.92rem] text-ink-soft">{r.body}</p>}
      <div className="label-mono mt-1.5 !text-[0.58rem] text-ink-soft/70">
        {r.author_name ?? "Verified owner"}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {r.status !== "approved" && (
          <button
            type="button"
            onClick={() => set("approved")}
            disabled={pending}
            className="label-mono cursor-pointer bg-brg px-3 py-2 !text-[0.62rem] text-cream disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {r.status !== "rejected" && (
          <button
            type="button"
            onClick={() => set("rejected")}
            disabled={pending}
            className="label-mono cursor-pointer border border-ink-soft px-3 py-2 !text-[0.62rem] text-ink-soft transition-colors hover:border-brg hover:text-brg disabled:opacity-60"
          >
            Reject
          </button>
        )}
        {msg && (
          <span className="label-mono !text-[0.6rem] text-ink-soft">{msg}</span>
        )}
      </div>
    </div>
  );
}

export default function ReviewsAdmin({ reviews }: { reviews: AdminReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-ink-soft/65 px-6 py-12 text-center text-ink-soft">
        No reviews yet. Verified buyers can leave one from a product page; they
        land here for approval.
      </div>
    );
  }
  return (
    <div className="mt-8 space-y-4">
      {reviews.map((r) => (
        <Card key={r.id} r={r} />
      ))}
    </div>
  );
}
