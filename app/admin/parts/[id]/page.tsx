import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import ProductEditor from "@/components/admin/ProductEditor";
import MatchingRequests from "@/components/admin/MatchingRequests";
import { emailConfigured } from "@/lib/email";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit part — Evocation admin",
  robots: { index: false },
};

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const product = data as Product;

  // demand matching: anyone in the queue waiting for a make+model this part fits
  const keys = (product.fitment_keys ?? []).filter(Boolean);
  let waiting: { id: string; email: string; make: string | null; model: string | null }[] = [];
  if (keys.length) {
    const { data: w } = await supabase
      .from("queue_requests")
      .select("id, email, make, model")
      .in("vehicle_key", keys)
      .is("notified_at", null)
      .order("created_at", { ascending: true });
    waiting = (w ?? []) as typeof waiting;
  }

  return (
    <main className="flex-1 py-12">
      <div className="wrap">
        <a href="/admin" className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg">
          ← Back to registry admin
        </a>
        <h1 className="font-display mt-3 mb-8 text-[1.8rem] font-bold">
          {product.evo_no} — {product.name}
        </h1>
        {keys.length > 0 && (
          <MatchingRequests
            productId={product.id}
            requests={waiting}
            configured={emailConfigured()}
          />
        )}
        <ProductEditor product={product} nextEvoNo={product.evo_no} />
      </div>
    </main>
  );
}
