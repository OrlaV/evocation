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
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Images only." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 8 MB." }, { status: 400 });
  }

  const slug = (form.get("slug")?.toString() || "misc").replace(
    /[^a-z0-9-]/gi,
    "",
  );
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${slug || "misc"}/${Date.now()}-${rand}.${ext}`;

  const supabase = createServiceClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ path });
}
