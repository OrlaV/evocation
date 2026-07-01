import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/* Auth redirect target for email links — confirmation, password recovery (and
   any future OAuth). Exchanges the code/token for a session cookie, then sends
   the user on to `next`. Add this URL to Supabase Auth → Redirect URLs. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  // only allow an internal path — reject "//evil.com" and absolute URLs so the
  // post-login redirect can't be turned into an open redirect for phishing.
  const nextParam = url.searchParams.get("next") || "/account";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/account";
  const fail = new URL("/account/login?err=link", url.origin);

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(fail);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return NextResponse.redirect(fail);
  } else {
    return NextResponse.redirect(fail);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
