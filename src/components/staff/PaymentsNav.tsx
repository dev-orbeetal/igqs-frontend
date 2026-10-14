"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function PaymentsNav() {
  const t = useTranslations("staff");
  const pathname = usePathname();
  const links = [
    { href: "/payments/fees", label: t("fees") },
    { href: "/payments/applications", label: t("applicationsPage") },
  ];

  return (
    <nav className="mt-6 flex gap-5 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname.startsWith(link.href) ? "text-igqs-gold" : "text-igqs-muted hover:text-igqs-green"}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
