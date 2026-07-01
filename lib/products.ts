import type { Product } from "./types";
import { normalizeRef } from "./types";
import { SEED_PRODUCTS } from "./seed";
import { createAnonClient, hasSupabase } from "./supabase";

/* Data access layer. Falls back to the local seed catalogue when the
   Supabase env vars are absent, so the site runs before the project
   exists and swaps over without a code change. */

export async function getPublishedProducts(): Promise<Product[]> {
  if (!hasSupabase()) {
    return SEED_PRODUCTS.filter((p) => p.status === "published");
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getPublishedProducts:", error.message);
    // stay consistent with the nominal path — never leak draft products,
    // even when falling back to the seed on a DB error.
    return SEED_PRODUCTS.filter((p) => p.status === "published");
  }
  return (data as Product[]) ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (!hasSupabase()) {
    return (
      SEED_PRODUCTS.find(
        (p) => p.slug === slug && p.status === "published",
      ) ?? null
    );
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("getProductBySlug:", error.message);
    return null;
  }
  return (data as Product) ?? null;
}

export async function searchProductsByRef(
  query: string,
): Promise<Product[]> {
  const normalized = normalizeRef(query);
  if (normalized.length < 3) return [];
  if (!hasSupabase()) {
    return SEED_PRODUCTS.filter((p) =>
      p.oem_refs.some((r) => {
        const n = normalizeRef(r);
        return (
          n === normalized ||
          (normalized.length >= 5 &&
            (n.includes(normalized) || normalized.includes(n)))
        );
      }),
    );
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .ilike("search_refs", `%${normalized}%`);
  if (error) {
    console.error("searchProductsByRef:", error.message);
    return [];
  }
  return (data as Product[]) ?? [];
}
