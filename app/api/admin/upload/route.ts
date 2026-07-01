import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/* Admin-only image upload to the public product-images bucket. Uses the service
   role (bypasses RLS) and is gated by the admin session, so we don't need an
   open "authenticated write" storage policy. Returns the bucket path. */
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 8 MB." }, { status: 400 });
  }

  // Whitelist raster formats by extension AND verify the file's magic bytes —
  // never trust the client-supplied MIME type. Notably this rejects SVG, which
  // can carry script and would be served from a public bucket (stored XSS).
  const RASTER: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
  };
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const contentType = RASTER[ext];
  if (!contentType) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP, GIF or AVIF images." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const b = bytes;
  const sig =
    (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff && contentType === "image/jpeg") ||
    (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && contentType === "image/png") ||
    (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && contentType === "image/gif") ||
    // RIFF....WEBP
    (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 &&
      contentType === "image/webp") ||
    // ....ftyp....avif  (brand at bytes 8..11)
    (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
      b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66 &&
      contentType === "image/avif");
  if (!sig) {
    return NextResponse.json(
      { error: "File contents don't match an allowed image format." },
      { status: 400 },
    );
  }

  const slug = (form.get("slug")?.toString() || "misc").replace(
    /[^a-z0-9-]/gi,
    "",
  );
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${slug || "misc"}/${Date.now()}-${rand}.${ext}`;

  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, bytes, { contentType, upsert: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ path });
}
