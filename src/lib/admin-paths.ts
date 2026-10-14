const ADMIN_PREFIXES = ["/login", "/content", "/payments", "/applications", "/dashboard"];

export function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAdminHost(headerList: { get(name: string): string | null }) {
  const raw = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const host = raw.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  return host === "admin.igqsbd.com";
}

export function canonicalAdminPath(pathname: string, onAdminHost: boolean) {
  let path = pathname;
  if (path === "/staff") path = onAdminHost ? "/" : "/dashboard";
  else if (path.startsWith("/staff/")) path = path.slice("/staff".length);
  if (onAdminHost && path === "/dashboard") path = "/";
  return path;
}
