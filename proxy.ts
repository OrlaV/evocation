import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Defense-in-depth for the back office. Every /admin page already calls
   requireAdmin() server-side (the real authorization); this proxy is a cheap
   net so a future admin page that forgets the call still can't render for a
   signed-out visitor. It only checks for the PRESENCE of a Supabase auth
   cookie — never trusts it as proof of admin — and redirects to the login
   otherwise. The page's requireAdmin() still does the authoritative check. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // the login page itself must stay reachable while signed out
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies
    .getAll()
    .some((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name));

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
