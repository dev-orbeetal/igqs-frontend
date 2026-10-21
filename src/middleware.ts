import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { canonicalAdminPath, isAdminPath } from "./lib/admin-paths";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const PUBLIC_ORIGIN = "https://igqsbd.com";
const ADMIN_ORIGIN = "https://admin.igqsbd.com";
const PUBLIC_HOSTS = new Set(["igqsbd.com", "www.igqsbd.com"]);
const ADMIN_HOSTS = new Set(["admin.igqsbd.com"]);
// Local dev runs one server for both the public site and the staff panel, by
// path, with no host split — these are the only hosts allowed to keep that
// behavior. Every other host (including a Vercel preview URL, which ends up
// documented and public) is treated as the public site: deny-by-default,
// so admin paths always bounce to the real admin host rather than rendering
// directly on an unrecognized domain.
const DEV_HOSTS = new Set(["localhost", "127.0.0.1"]);

function requestHost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const raw = (forwarded ?? request.headers.get("host") ?? "").split(",")[0];
  return raw.trim().split(":")[0].toLowerCase();
}

export default function middleware(request: NextRequest) {
  const host = requestHost(request);
  const { pathname, search } = request.nextUrl;

  // One hop to the apex, including a trailing-slash strip, so www is not a
  // second indexable host and does not chain into the slash redirect below.
  if (host === "www.igqsbd.com") {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
    return NextResponse.redirect(new URL(`${path}${search}`, PUBLIC_ORIGIN), 301);
  }

  const onAdmin = ADMIN_HOSTS.has(host);
  const onPublic = PUBLIC_HOSTS.has(host) || (!onAdmin && !DEV_HOSTS.has(host));
  const canonical = canonicalAdminPath(pathname, onAdmin);
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url);
  }

  if (canonical !== pathname) {
    const origin = onPublic ? ADMIN_ORIGIN : request.url;
    return NextResponse.redirect(new URL(`${canonical}${search}`, origin));
  }

  if (onAdmin && pathname !== "/" && !isAdminPath(pathname)) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, PUBLIC_ORIGIN));
  }

  if (onPublic && isAdminPath(pathname)) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, ADMIN_ORIGIN));
  }

  const headers = new Headers(request.headers);
  headers.set("accept-language", routing.defaultLocale);
  return handleI18nRouting(new NextRequest(request, { headers }));
}

export const config = {
  // staff-support is excluded alongside api/trpc/_next/_vercel: it's a
  // plain top-level route.ts (no dot in its path, unlike /media/*.jpg),
  // so without this it would otherwise get caught by the locale rewrite
  // below and 404 (there's no [locale]/staff-support page).
  matcher: "/((?!api|trpc|_next|_vercel|staff-support|.*\\..*).*)",
};
