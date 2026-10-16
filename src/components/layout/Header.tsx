"use client";

import { CalendarDays, Home, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { startTransition, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/icons/Social";
import { LanguageSwitcher } from "@/components/locale/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { isAdminPath } from "@/lib/admin-paths";
import type { SiteSettings } from "@/lib/api";

const LINKS = [
  { href: "/about", key: "about" },
  { href: "/curriculum", key: "curriculum" },
  { href: "/events", key: "events" },
  { href: "/news", key: "news" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
] as const;

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.95c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.63-.61-2.86-1.24-4.72-4.12-4.86-4.31-.14-.19-1.15-1.53-1.15-2.92s.73-2.07 1-2.35c.24-.26.64-.38.85-.38.21 0 .42 0 .6.01.19.01.45-.07.7.54.26.63.87 2.16.95 2.32.08.16.13.35.03.56-.1.21-.16.34-.31.52-.16.18-.33.4-.47.54-.16.16-.32.33-.14.64.19.31.83 1.37 1.78 2.22 1.22 1.09 2.25 1.43 2.57 1.59.31.16.5.13.68-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.16.28.1 1.78.84 2.08.99.31.16.51.23.58.36.08.13.08.75-.16 1.43z" />
    </svg>
  );
}

export function Header({ site, adminSite = false }: { site?: SiteSettings | null; adminSite?: boolean }) {
  const t = useTranslations("nav");
  const ta = useTranslations("a11y");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function scrollToNotices(event: MouseEvent<HTMLAnchorElement>) {
    setDrawerOpen(false);
    if (pathname !== "/") return;
    const target = document.getElementById("notices");
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    startTransition(() => setDrawerOpen(false));
  }, [pathname]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const update = () => {
      const row = rowRef.current;
      const measure = measureRef.current;
      const links = measure?.querySelector<HTMLElement>("[data-links]");
      const actions = measure?.querySelector<HTMLElement>("[data-actions]");
      if (!row || !links || !actions) return;
      const logo = logoRef.current?.offsetWidth ?? 0;
      const tools = toolsRef.current?.offsetWidth ?? 0;
      const menu = menuRef.current?.offsetWidth ?? 0;
      const persistent = menu > 0 ? Math.max(0, tools - menu - 8) : tools;
      const style = getComputedStyle(row);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const reserved = logo + actions.offsetWidth + persistent + padding + 12 + 12 + 8;
      const available = row.clientWidth - reserved;
      const overflow = links.offsetWidth > available + 1;
      setCompact(overflow);
      if (!overflow) setDrawerOpen(false);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    observer.observe(measure);
    if (logoRef.current) observer.observe(logoRef.current);
    if (toolsRef.current) observer.observe(toolsRef.current);
    return () => observer.disconnect();
  }, [locale]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  if (adminSite || isAdminPath(pathname)) return null;

  const today = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const social = [
    site?.facebook_url ? { href: site.facebook_url, label: "Facebook", icon: FacebookIcon } : null,
    site?.youtube_url ? { href: site.youtube_url, label: "YouTube", icon: YoutubeIcon } : null,
    site?.instagram_url ? { href: site.instagram_url, label: "Instagram", icon: InstagramIcon } : null,
    site?.whatsapp_url || site?.phone_primary
      ? {
          href:
            site?.whatsapp_url ||
            `https://wa.me/${digitsOnly(site?.phone_primary || "")}`,
          label: "WhatsApp",
          icon: WhatsAppIcon,
        }
      : null,
  ].filter((item): item is { href: string; label: string; icon: typeof FacebookIcon } => Boolean(item?.href));

  const linkClass = (active: boolean) =>
    `inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
      active
        ? "bg-igqs-green text-white dark:bg-igqs-gold dark:text-igqs-ink"
        : "text-igqs-ink hover:bg-igqs-sand/70 dark:text-igqs-cream dark:hover:bg-white/10"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 bg-igqs-cream transition-shadow duration-200 print:hidden dark:bg-[#07140f] ${
        scrolled ? "shadow-[0_4px_20px_rgba(15,23,42,0.08)]" : ""
      }`}
    >
      <div className={`${compact ? "hidden" : "hidden md:block"} bg-[#0f172a] text-white`}>
        <div className="mx-auto flex h-6 max-w-7xl items-center justify-between px-4 text-[11px] sm:px-6 sm:text-xs">
          <p className="flex min-w-0 items-center gap-1.5 truncate text-white/90">
            <CalendarDays className="size-3 shrink-0 opacity-80" />
            <span className="truncate">{today}</span>
          </p>
          <div className="flex items-center gap-3">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="opacity-90 hover:opacity-100"
              >
                <item.icon className="size-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-igqs-gold/20">
        <div ref={rowRef} className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
          <div ref={logoRef} className="shrink-0">
            <Logo compact href="/" />
          </div>
          <nav aria-label="Primary" className={`min-w-0 flex-1 ${compact ? "hidden" : "hidden md:block"}`}>
            <ul className="flex items-center gap-1">
              <li>
                <Link href="/" className={`${linkClass(isActive("/"))} gap-1 font-semibold`}>
                  <Home className="size-3 shrink-0" />
                  {t("home")}
                </Link>
              </li>
              {LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass(isActive(item.href))}>
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/#notices"
              onClick={scrollToNotices}
              className={`${compact ? "hidden" : "hidden md:inline-flex"} items-center rounded-md border border-igqs-green px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-igqs-green transition hover:bg-igqs-green hover:text-white dark:border-igqs-gold dark:text-igqs-gold dark:hover:bg-igqs-gold dark:hover:text-igqs-ink`}
            >
              {t("notices")}
            </Link>
            <Link
              href="/admission"
              className={`${compact ? "hidden" : "hidden md:inline-flex"} items-center rounded-md bg-igqs-green px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white transition hover:brightness-110 dark:bg-igqs-gold dark:text-igqs-ink`}
            >
              {t("apply")}
            </Link>
            <div ref={toolsRef} className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                ref={menuRef}
                type="button"
                className={`${compact ? "inline-flex" : "inline-flex md:hidden"} size-8 items-center justify-center rounded-full border border-igqs-gold/40 text-igqs-ink dark:text-igqs-cream`}
                onClick={() => setDrawerOpen((open) => !open)}
                aria-label={ta("menu")}
                aria-expanded={drawerOpen}
              >
                {drawerOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </div>
          <div
            ref={measureRef}
            className="pointer-events-none absolute top-0 left-0 -z-10 w-max opacity-0"
            aria-hidden
            inert
          >
            <div data-links className="flex w-max items-center gap-1">
              <span className={`${linkClass(false)} gap-1 font-semibold`}>
                <Home className="size-3 shrink-0" />
                {t("home")}
              </span>
              {LINKS.map((item) => (
                <span key={item.href} className={linkClass(false)}>
                  {t(item.key)}
                </span>
              ))}
            </div>
            <div data-actions className="flex w-max items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-igqs-green px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                {t("notices")}
              </span>
              <span className="inline-flex items-center rounded-md bg-igqs-green px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                {t("apply")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="border-b border-igqs-gold/20 bg-igqs-cream px-4 py-4 dark:bg-[#07140f]">
          <div className="grid gap-1">
            <Link href="/" onClick={() => setDrawerOpen(false)} className={linkClass(isActive("/"))}>
              {t("home")}
            </Link>
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={linkClass(isActive(item.href))}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href="/#notices"
              onClick={scrollToNotices}
              className="mt-2 inline-flex justify-center rounded-md border border-igqs-green px-3 py-2 text-sm font-semibold text-igqs-green dark:border-igqs-gold dark:text-igqs-gold"
            >
              {t("notices")}
            </Link>
            <Link
              href="/admission"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex justify-center rounded-md bg-igqs-green px-3 py-2 text-sm font-semibold text-white dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {t("apply")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
