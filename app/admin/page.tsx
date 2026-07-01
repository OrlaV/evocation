import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/types";
import type { Product } from "@/lib/types";
import SignOutButton from "@/components/admin/SignOutButton";

export const metadata: Metadata = {
  title: "Admin — Evocation",
  robots: { index: false },
};

export default async function AdminPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("evo_no");
  const products = (data as Product[]) ?? [];

  return (
    <main className="flex-1 py-12">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label-mono !tracking-[0.18em] text-brg">
              Workshop
            </div>
            <h1 className="font-display mt-1 text-[1.8rem] font-bold">
              The Registry — admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/orders"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Orders →
            </a>
            <a
              href="/admin/queue"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Queue requests →
            </a>
            <a
              href="/admin/returns"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Returns →
            </a>
            <a
              href="/admin/reviews"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Reviews →
            </a>
            <a
              href="/admin/donors"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Donor offers →
            </a>
            <a
              href="/admin/settings"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Settings →
            </a>
            <a
              href="/admin/team"
              className="label-mono border border-hairline px-4 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Team →
            </a>
            <SignOutButton />
            <a
              href="/admin/parts/new"
              className="label-mono border border-transparent bg-brg px-5 py-3 text-cream transition-colors hover:bg-brg-deep"
            >
              + New part
            </a>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse border-t border-hairline">
          <thead>
            <tr>
              {["Part no.", "Name", "Status", "Price", "Refs", ""].map((h) => (
                <th
                  key={h}
                  className="label-mono border-b border-hairline py-3 pr-3 text-left !text-[0.66rem] !tracking-[0.12em] text-ink-soft"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="group">
                <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.75rem] text-brass">
                  {p.evo_no}
                </td>
                <td className="border-b border-hairline py-3.5 pr-3 text-[0.95rem] font-medium">
                  {p.name}
                </td>
                <td className="border-b border-hairline py-3.5 pr-3">
                  <span
                    className={`label-mono border px-2 py-[2px] !text-[0.65rem] ${
                      p.status === "published"
                        ? "border-brg text-brg"
                        : "border-ink-soft text-ink-soft"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.8rem]">
                  {formatPrice(p.price_pence)}
                </td>
                <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.78rem] text-ink-soft">
                  {p.oem_refs.join(", ")}
                </td>
                <td className="border-b border-hairline py-3.5 text-right">
                  <a
                    href={`/admin/parts/${p.id}`}
                    className="label-mono !text-[0.68rem] text-brg hover:underline"
                  >
                    Edit →
                  </a>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-ink-soft"
                >
                  No parts yet — create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
