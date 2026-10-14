import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { canonicalAdminPath, isAdminPath } from "./lib/admin-paths";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const PUBLIC_ORIGIN = "https://igqsbd.com";
const ADMIN_ORIGIN = "https://admin.igqsbd.com";
const PUBLIC_HOSTS = new Set(["igqsbd.com", "www.igqsbd.com"]);
const ADMIN_HOSTS = new Set(["admin.igqsbd.com"]);

function requestHost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const raw = (forwarded ?? request.headers.get("host") ?? "").split(",")[0];
  return raw.trim().split(":")[0].toLowerCase();
}

export default function middleware(request: NextRequest) {
  const host = requestHost(request);
  const { pathname, search } = request.nextUrl;
  const onAdmin = ADMIN_HOSTS.has(host);
  const onPublic = PUBLIC_HOSTS.has(host);
  const canonical = canonicalAdminPath(pathname, onAdmin);

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
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
