/* Crée le compte admin Supabase Auth.
   Usage : npx tsx scripts/create-admin.ts <email> */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file: string) {
  const txt = readFileSync(resolve(process.cwd(), file), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && m[2]) process.env[m[1]] ??= m[2].trim();
  }
}

loadEnv(".env.local");

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/create-admin.ts <email>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const password = randomBytes(12).toString("base64url");
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  console.log(`Admin created: ${email}`);
  console.log(`Temporary password: ${password}`);
  console.log("Change it after first login (Supabase dashboard or reset).");
}

main();
