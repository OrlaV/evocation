import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Runs before every page (not API/static). Two jobs:

   1) Refresh the Supabase session and propagate rotated cookies onto the
      response — the @supabase/ssr pattern. Without this, a token refreshed
      inside a Server Component can't write its cookies (setAll is a no-op
      there), so the rotated refresh token is lost and signed-in customers get
      logged out over time.

   2) Defense-in-depth guard for /admin: bounce signed-out visitors to the
      login early. The REAL authorization is requireAdmin() in every admin page
      and server action — this is only a net. */

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

const isGuardedAdmin = (pathname: string) =>
  pathname.startsWith("/admin") && pathname !== "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured (e.g. seed/local without env): fall back to a
  // cookie-presence guard on /admin, no session work.
  if (!supabaseUrl || !anonKey) {
    if (isGuardedAdmin(pathname)) {
      const hasSession = request.cookies
        .getAll()
        .some((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name));
      if (!hasSession) return loginRedirect(request);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates AND refreshes the session (writing rotated cookies via
  // setAll above). Anonymous visitors short-circuit with no network call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isGuardedAdmin(pathname) && !user) {
    return loginRedirect(request);
  }

  return response;
}

export const config = {
  // every page except API routes (they manage their own auth), Next internals
  // and metadata files. Covers /admin for both the refresh and the guard.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
