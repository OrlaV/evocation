/* Seed/upsert du catalogue local vers Supabase.
   Usage : npx tsx scripts/seed.ts  (depuis evocation/) */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SEED_PRODUCTS } from "../lib/seed";

function loadEnv(file: string) {
  const txt = readFileSync(resolve(process.cwd(), file), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && m[2]) process.env[m[1]] ??= m[2].trim();
  }
}

loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  // les ids du seed local ne sont pas des uuid — on laisse Postgres les générer
  const rows = SEED_PRODUCTS.map(({ id: _id, ...rest }) => rest);
  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "evo_no" })
    .select("evo_no, slug, status");
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log("Seeded products:");
  for (const r of data ?? []) console.log(` - ${r.evo_no} (${r.status}) ${r.slug}`);
}

main();
