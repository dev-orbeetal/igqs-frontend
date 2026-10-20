"use client";

import { Home, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { startTransition, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/locale/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { isAdminPath } from "@/lib/admin-paths";

const LINKS = [
  { href: "/about", key: "about" },
  { href: "/curriculum", key: "curriculum" },
  { href: "/events", key: "events" },
  { href: "/news", key: "news" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ adminSite = false }: { adminSite?: boolean }) {
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
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDrawerOpen(false);
      menuRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  if (adminSite || isAdminPath(pathname)) return null;

  const linkClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
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
      <div className="border-b border-igqs-gold/20">
        <div ref={rowRef} className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
          <div ref={logoRef} className="shrink-0">
            <Logo compact href="/" />
          </div>
          <nav aria-label={ta("primaryNav")} className={`min-w-0 flex-1 ${compact ? "hidden" : "hidden md:block"}`}>
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
              href="/notices"
              onClick={() => setDrawerOpen(false)}
              className={`${compact ? "hidden" : "hidden md:inline-flex"} min-h-11 items-center rounded-md border border-igqs-green px-3 py-2 text-xs font-semibold whitespace-nowrap text-igqs-green transition hover:bg-igqs-green hover:text-white dark:border-igqs-gold dark:text-igqs-gold dark:hover:bg-igqs-gold dark:hover:text-igqs-ink`}
            >
              {t("notices")}
            </Link>
            <Link
              href="/admission"
              className={`${compact ? "hidden" : "hidden md:inline-flex"} min-h-11 items-center rounded-md bg-igqs-green px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition hover:brightness-110 dark:bg-igqs-gold dark:text-igqs-ink`}
            >
              {t("apply")}
            </Link>
            <div ref={toolsRef} className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                ref={menuRef}
                type="button"
                className={`${compact ? "inline-flex" : "inline-flex md:hidden"} size-11 items-center justify-center rounded-full border border-igqs-gold/40 text-igqs-ink dark:text-igqs-cream`}
                onClick={() => setDrawerOpen((open) => !open)}
                aria-label={drawerOpen ? ta("closeMenu") : ta("menu")}
                aria-expanded={drawerOpen}
                aria-controls="site-menu"
              >
                {drawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
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
        <div id="site-menu" className="border-b border-igqs-gold/20 bg-igqs-cream px-4 py-4 dark:bg-[#07140f]">
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
              href="/notices"
              onClick={() => setDrawerOpen(false)}
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-md border border-igqs-green px-3 py-2 text-sm font-semibold text-igqs-green dark:border-igqs-gold dark:text-igqs-gold"
            >
              {t("notices")}
            </Link>
            <Link
              href="/admission"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-igqs-green px-3 py-2 text-sm font-semibold text-white dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {t("apply")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
