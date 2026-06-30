"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignOutButton({
  redirectTo = "/admin/login",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createSupabaseBrowserClient().auth.signOut();
        router.push(redirectTo);
        router.refresh();
      }}
      className="label-mono cursor-pointer border border-hairline px-4 py-2.5 !text-[0.68rem] text-ink-soft transition-colors hover:border-ink hover:text-ink"
    >
      Sign out
    </button>
  );
}
