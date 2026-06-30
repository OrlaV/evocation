import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { addAdminAction, removeAdminAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Team — Evocation admin",
  robots: { index: false },
};

type AdminRow = { user_id: string; email: string | null; added_at: string };

const MESSAGES: Record<string, { text: string; ok: boolean }> = {
  added: { text: "Admin added.", ok: true },
  removed: { text: "Admin removed.", ok: true },
  invalid: { text: "Enter a valid email.", ok: false },
  noaccount: {
    text: "No account with that email yet — ask them to sign up first, then add them.",
    ok: false,
  },
  last: { text: "You can't remove the last admin.", ok: false },
  db: { text: "Something went wrong — try again.", ok: false },
};

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; err?: string }>;
}) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const banner = MESSAGES[sp.msg ?? sp.err ?? ""] ?? null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("user_id, email, added_at")
    .order("added_at", { ascending: true });
  const admins = (data as AdminRow[]) ?? [];

  const envEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[760px]">
        <a
          href="/admin"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to registry admin
        </a>
        <div className="mt-3">
          <div className="label-mono !tracking-[0.18em] text-brg">Workshop</div>
          <h1 className="font-display mt-1 text-[1.8rem] font-bold">Team</h1>
          <p className="mt-2 max-w-[52ch] text-[0.95rem] text-ink-soft">
            Admins can open the workshop tools (registry, queue, donors,
            settings). Add someone by the email they signed up with.
          </p>
        </div>

        {banner && (
          <div
            className={`label-mono mt-6 border px-4 py-3 !text-[0.7rem] !tracking-[0.08em] ${
              banner.ok ? "border-brg text-brg" : "border-ink-soft text-ink-soft"
            }`}
          >
            {banner.text}
          </div>
        )}

        <form action={addAdminAction} className="mt-6 flex max-w-[460px] gap-0">
          <input
            type="email"
            name="email"
            required
            placeholder="person@email.com"
            aria-label="New admin email"
            className="min-w-0 flex-1 border border-hairline bg-transparent px-4 py-3 font-mono text-[0.82rem] tracking-[0.04em] text-ink outline-none transition-colors focus:border-ink"
          />
          <button
            type="submit"
            className="label-mono cursor-pointer border border-transparent bg-brg px-5 text-cream transition-colors hover:bg-brg-deep"
          >
            Add admin
          </button>
        </form>

        <table className="mt-8 w-full border-collapse border-t border-hairline">
          <thead>
            <tr>
              {["Admin", "Added", ""].map((h) => (
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
            {admins.map((a) => (
              <tr key={a.user_id}>
                <td className="border-b border-hairline py-3.5 pr-3 text-[0.92rem] font-medium">
                  {a.email ?? a.user_id}
                  {a.user_id === me.id && (
                    <span className="label-mono ml-2 !text-[0.6rem] text-ink-soft">
                      (you)
                    </span>
                  )}
                </td>
                <td className="border-b border-hairline py-3.5 pr-3 font-mono text-[0.78rem] text-ink-soft">
                  {new Date(a.added_at).toLocaleDateString("en-GB")}
                </td>
                <td className="border-b border-hairline py-3.5 text-right">
                  <form action={removeAdminAction}>
                    <input type="hidden" name="user_id" value={a.user_id} />
                    <button
                      type="submit"
                      className="label-mono cursor-pointer !text-[0.66rem] text-ink-soft transition-colors hover:text-brg"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="py-10 text-center text-ink-soft">
                  No admins in the table yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {envEmails.length > 0 && (
          <p className="label-mono mt-6 !text-[0.66rem] !tracking-[0.08em] text-ink-soft/80">
            Break-glass: {envEmails.join(", ")} {envEmails.length === 1 ? "is" : "are"}{" "}
            always admin via the ADMIN_EMAILS env var, table or not. Keep one
            here as a fallback.
          </p>
        )}
      </div>
    </main>
  );
}
