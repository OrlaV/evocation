import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/settings";
import SettingsEditor from "@/components/admin/SettingsEditor";

export const metadata: Metadata = {
  title: "Settings — Evocation admin",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <main className="flex-1 py-12">
      <div className="wrap">
        <a
          href="/admin"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to registry admin
        </a>
        <h1 className="font-display mt-3 mb-2 text-[1.8rem] font-bold">
          Settings
        </h1>
        <p className="mb-2 max-w-[60ch] font-mono text-[0.74rem] leading-[1.5] text-ink-soft/80">
          Adjustable business parameters. Secrets (Stripe keys, admin emails, tax
          toggle) stay in environment variables, not here.
        </p>
        <SettingsEditor settings={settings} />
      </div>
    </main>
  );
}
