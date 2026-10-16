"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Home,
  Images,
  Info,
  LayoutDashboard,
  type LucideIcon,
  Menu,
  Newspaper,
  Phone,
  Wallet,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/locale/LanguageSwitcher";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { clearStaffToken, getStaffToken, staffLogout, staffRequest, type StaffUser } from "@/lib/staff";

const adminLoginDisabled = process.env.NEXT_PUBLIC_ADMIN_LOGIN_DISABLED === "true";

export function StaffShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("staff");
  const cms = useTranslations("cms");
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-igqs-muted">
        {t("loading")}
      </div>
    );
  }

  const groups: { label: string; links: { href: string; label: string; icon: LucideIcon; match: boolean }[] }[] = [
    {
      label: t("navOverview"),
      links: [
        { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, match: pathname === "/" || pathname === "/dashboard" },
      ],
    },
    {
      label: t("navAdmissions"),
      links: [
        { href: "/payments/applications", label: t("applicationsPage"), icon: ClipboardList, match: pathname.startsWith("/payments/applications") },
        { href: "/payments/fees", label: t("fees"), icon: Wallet, match: pathname.startsWith("/payments/fees") },
      ],
    },
    {
      label: t("navWebsite"),
      links: [
        { href: "/content/home", label: cms("home"), icon: Home, match: pathname.startsWith("/content/home") },
        { href: "/content/about", label: cms("about"), icon: Info, match: pathname.startsWith("/content/about") },
        { href: "/content/curriculum", label: cms("curriculum"), icon: BookOpen, match: pathname.startsWith("/content/curriculum") },
        { href: "/content/events", label: cms("events"), icon: CalendarDays, match: pathname.startsWith("/content/events") },
        { href: "/content/news", label: cms("news"), icon: Newspaper, match: pathname.startsWith("/content/news") },
        { href: "/content/gallery", label: cms("gallery"), icon: Images, match: pathname.startsWith("/content/gallery") },
        { href: "/content/contact", label: cms("contact"), icon: Phone, match: pathname.startsWith("/content/contact") },
        { href: "/content/admission", label: cms("admission"), icon: GraduationCap, match: pathname.startsWith("/content/admission") },
      ],
    },
  ];
  const links = groups.flatMap((group) => group.links);
  const current = links.find((link) => link.match)?.label || t("dashboard");

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-igqs-ink lg:grid lg:grid-cols-[260px_1fr] dark:bg-[#07140f] dark:text-igqs-sand">
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label={t("closeMenu")}
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col gap-4 bg-gradient-to-b from-[#0f3d30] to-[#07140f] px-4 py-5 text-[#dbe7f3] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 pb-4 text-center">
          <Logo iconOnly href="/dashboard" />
          <p className="mt-3 text-center text-xs tracking-wide text-white/70">{t("kicker")}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto text-sm">
          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{group.label}</p>
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.match ? "page" : undefined}
                    className={`mt-1 flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igqs-gold ${
                      link.match ? "bg-white/20 font-semibold text-white" : "text-[#dbe7f3] hover:bg-white/10 active:bg-white/15"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-3">
          <div className="font-bold text-white">{user?.name || user?.username}</div>
          {!adminLoginDisabled && (
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igqs-gold"
              onClick={async () => {
                await staffLogout();
                router.replace("/login");
              }}
            >
              {t("logout")}
            </button>
          )}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center gap-3 border-b border-igqs-gold/15 bg-white px-4 py-4 dark:bg-[#0d1f18]">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-igqs-gold/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igqs-gold lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <h1 className="min-w-0 flex-1 font-display text-2xl">{current}</h1>
          <LanguageSwitcher />
        </header>
        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
