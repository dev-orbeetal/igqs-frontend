"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/locale/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { clearStaffToken, getStaffToken, staffLogout, staffRequest, type StaffUser } from "@/lib/staff";

const adminLoginDisabled = process.env.NEXT_PUBLIC_ADMIN_LOGIN_DISABLED === "true";

export function StaffShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("staff");
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!adminLoginDisabled && !getStaffToken()) {
      router.replace("/login");
      return;
    }
    staffRequest<StaffUser>("/api/admissions/staff/me/")
      .then((me) => {
        setUser(me);
        setReady(true);
      })
      .catch(() => {
        clearStaffToken();
        router.replace("/login");
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-igqs-muted">
        {t("loading")}
      </div>
    );
  }

  const links = [
    { href: "/dashboard", label: t("dashboard"), match: pathname === "/" || pathname === "/dashboard" },
    { href: "/payments/applications", label: t("applications"), match: pathname.startsWith("/payments") },
    { href: "/content", label: t("website"), match: pathname.startsWith("/content") },
  ];

  return (
    <div className="min-h-screen bg-igqs-cream dark:bg-[#07140f]">
      <header className="border-b border-igqs-gold/20 bg-white/90 backdrop-blur dark:bg-[#0d1f18]/90">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-igqs-muted md:inline">{user?.name}</span>
              <LanguageSwitcher />
              <ThemeToggle />
              {!adminLoginDisabled && (
                <button
                  type="button"
                  className="min-h-10 rounded-full border border-igqs-gold/40 px-3 py-1.5 text-sm"
                  onClick={async () => {
                    await staffLogout();
                    router.replace("/login");
                  }}
                >
                  {t("logout")}
                </button>
              )}
            </div>
          </div>
          <nav className="-mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-1 text-sm whitespace-nowrap sm:mx-0 sm:px-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.match ? "text-igqs-gold" : "text-igqs-muted hover:text-igqs-green"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
