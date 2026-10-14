"use client";

import { usePathname } from "@/i18n/navigation";
import { isAdminPath } from "@/lib/admin-paths";

export function HideOnStaff({
  children,
  adminSite = false,
}: {
  children: React.ReactNode;
  adminSite?: boolean;
}) {
  const pathname = usePathname();
  if (adminSite || isAdminPath(pathname)) return null;
  return children;
}
