"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/locale/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/api";
import { isAdminPath } from "@/lib/admin-paths";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/curriculum", key: "curriculum" },
  { href: "/events", key: "events" },
  { href: "/news", key: "news" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ site, adminSite = false }: { site?: SiteSettings | null; adminSite?: boolean }) {
  const t = useTranslations("nav");
  const ta = useTranslations("a11y");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (adminSite || isAdminPath(pathname)) return null;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-500 print:hidden ${
        scrolled
          ? "border-igqs-gold/25 bg-[#0c2f25]/94 shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
          : "border-igqs-gold/15 bg-[#0f3d30]/80"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <Logo light />
        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm transition-colors duration-500 ${
                  active
                    ? "text-igqs-gold"
                    : "text-igqs-cream/75 hover:text-igqs-gold-soft"
                }`}
              >
                {t(item.key)}
                <span
                  className={`absolute inset-x-0 -bottom-1 h-px bg-igqs-gold transition-opacity duration-500 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/admission"
            className="btn-gold hidden px-4 py-2 sm:inline-flex"
          >
            {t("apply")}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-igqs-gold/40 text-igqs-cream transition-colors duration-500 hover:bg-igqs-gold/15 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={ta("menu")}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-igqs-gold/20 bg-[#0c2f25]/96 px-4 py-5 backdrop-blur-xl lg:hidden">
          <p className="eyebrow mb-4">{site?.school_name}</p>
          <div className="grid gap-1">
            {LINKS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-base transition-colors duration-500 ${
                    active
                      ? "bg-igqs-gold/12 text-igqs-gold"
                      : "text-igqs-cream/90 hover:bg-white/5 hover:text-igqs-gold-soft"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <Link
              href="/admission"
              onClick={() => setOpen(false)}
              className="btn-gold mt-3 inline-flex w-full justify-center"
            >
              {t("apply")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
