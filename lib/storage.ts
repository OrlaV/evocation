/* Public URL for a product image stored in the Supabase `product-images`
   bucket. Accepts a bucket path ("evo-001/front.jpg") or a full URL (returned
   as-is). NEXT_PUBLIC_SUPABASE_URL is public, so this is safe on the client. */
export function imageUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/product-images/${path.replace(/^\/+/, "")}`;
}
