import type { Metadata } from "next";
import { requireUser } from "@/lib/customer-auth";
import { createServiceClient } from "@/lib/supabase-server";
import ProfileForm, { type ProfileInitial } from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "Profile — Evocation",
  robots: { index: false },
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const initial: ProfileInitial = {
    full_name: str(data?.full_name),
    phone: str(data?.phone),
    address_line1: str(data?.address_line1),
    address_line2: str(data?.address_line2),
    address_city: str(data?.address_city),
    address_state: str(data?.address_state),
    address_postal_code: str(data?.address_postal_code),
    address_country: str(data?.address_country),
    marketing_opt_in: Boolean(data?.marketing_opt_in),
  };

  return (
    <main className="flex-1 py-12">
      <div className="wrap max-w-[760px]">
        <a
          href="/account"
          className="label-mono !text-[0.68rem] text-ink-soft hover:text-brg"
        >
          ← Back to your garage
        </a>
        <div className="mt-3">
          <div className="label-mono !tracking-[0.18em] text-brg">
            Your garage
          </div>
          <h1 className="font-display mt-1 text-[1.8rem] font-bold">Profile</h1>
        </div>
        <ProfileForm initial={initial} email={user.email ?? ""} />
      </div>
    </main>
  );
}
