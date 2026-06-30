import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { getSettings } from "@/lib/settings";
import ProductEditor from "@/components/admin/ProductEditor";

export const metadata: Metadata = {
  title: "New part — Evocation admin",
  robots: { index: false },
};

export default async function NewPartPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  // Take the highest trailing number across ALL evo_no, whatever the maker
  // scheme (EVO-LR-0003, EVO-POR-001…). Lexicographic ordering is wrong here
  // ("POR" > "LR"), so compute the max numerically. The maker code can't be
  // known yet — the admin edits the suggestion (e.g. EVO-LR-0004).
  const { data } = await supabase.from("products").select("evo_no");
  const maxNum = (data ?? []).reduce((max, r) => {
    const m = String(r.evo_no).match(/(\d+)\s*$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  const next = `EVO-${String(maxNum + 1).padStart(4, "0")}`;
  const settings = await getSettings();

  return (
    <main className="flex-1 py-12">
      <div className="wrap">
        <a href="/admin" className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg">
          ← Back to registry admin
        </a>
        <h1 className="font-display mt-3 mb-8 text-[1.8rem] font-bold">
          New part — {next}
        </h1>
        <ProductEditor
          product={null}
          nextEvoNo={next}
          defaultSlots={settings.defaultSlots}
        />
      </div>
    </main>
  );
}
