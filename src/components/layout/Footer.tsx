"use client";

import { ArrowUp, ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/icons/Social";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/api";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold leading-none text-white">{children}</h3>
      <span className="mt-2.5 block h-[3px] w-full rounded-full bg-igqs-gold" aria-hidden />
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group flex items-start gap-1.5 text-white/75 transition hover:text-white">
      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-white/55 transition group-hover:text-white" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.95c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.63-.61-2.86-1.24-4.72-4.12-4.86-4.31-.14-.19-1.15-1.53-1.15-2.92s.73-2.07 1-2.35c.24-.26.64-.38.85-.38.21 0 .42 0 .6.01.19.01.45-.07.7.54.26.63.87 2.16.95 2.32.08.16.13.35.03.56-.1.21-.16.34-.31.52-.16.18-.33.4-.47.54-.16.16-.32.33-.14.64.19.31.83 1.37 1.78 2.22 1.22 1.09 2.25 1.43 2.57 1.59.31.16.5.13.68-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.16.28.1 1.78.84 2.08.99.31.16.51.23.58.36.08.13.08.75-.16 1.43z" />
    </svg>
  );
}

export function Footer({ site }: { site?: SiteSettings | null }) {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const year = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", { year: "numeric" }).format(new Date());

  const phones = [site?.phone_primary, site?.phone_secondary].filter((phone): phone is string => Boolean(phone));
  const emails = site?.email ? [site.email] : [];
  const social = [
    site?.facebook_url ? { href: site.facebook_url, label: "Facebook", icon: FacebookIcon } : null,
    site?.youtube_url ? { href: site.youtube_url, label: "YouTube", icon: YoutubeIcon } : null,
    site?.instagram_url ? { href: site.instagram_url, label: "Instagram", icon: InstagramIcon } : null,
    site?.whatsapp_url ? { href: site.whatsapp_url, label: "WhatsApp", icon: WhatsAppIcon } : null,
  ].filter((item): item is { href: string; label: string; icon: typeof FacebookIcon } => Boolean(item));

  const quickLinks = [
    { label: t("home"), href: "/" },
    { label: t("admission"), href: "/admission" },
    { label: t("curriculum"), href: "/curriculum" },
    { label: t("events"), href: "/events" },
  ];
  const infoLinks = [
    { label: t("about"), href: "/about" },
    { label: t("news"), href: "/news" },
    { label: t("gallery"), href: "/gallery" },
    { label: t("contact"), href: "/contact" },
    { label: t("receipt"), href: "/admission/receipt" },
  ];

  return (
    <footer className="relative mt-4 bg-[#0f1115] text-white print:hidden">
      <div className="mx-auto grid max-w-7xl items-start gap-x-6 gap-y-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="mb-3">
            <Logo iconOnly />
          </div>
          {site?.tagline && <p className="max-w-sm text-sm leading-relaxed text-white/70">{site.tagline}</p>}
          {social.length > 0 && (
            <div className="mt-4 grid max-w-[220px] grid-cols-4 gap-2.5">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-igqs-gold hover:text-igqs-ink"
                >
                  <item.icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <FooterHeading>{tf("quick")}</FooterHeading>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href} label={link.label} />
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <FooterHeading>{tf("info")}</FooterHeading>
          <ul className="space-y-2.5 text-sm">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href} label={link.label} />
              </li>
            ))}
          </ul>
        </div>

        {(site?.address || phones.length > 0 || emails.length > 0) && (
          <div className="lg:col-span-3">
            <FooterHeading>{tf("contact")}</FooterHeading>
            <ul className="space-y-3 text-sm text-white/75">
              {site?.address && (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white" />
                  <span>{site.address}</span>
                </li>
              )}
              {phones.map((phone, index) => {
                const digits = digitsOnly(phone);
                const whatsapp = digits ? `https://wa.me/${digits}` : undefined;
                return (
                  <li key={phone}>
                    <a
                      href={whatsapp || `tel:${phone}`}
                      target={whatsapp ? "_blank" : undefined}
                      rel={whatsapp ? "noopener noreferrer" : undefined}
                      className="flex gap-2.5 transition hover:text-white"
                    >
                      {index === 0 ? <Phone className="mt-0.5 size-4 shrink-0 text-white" /> : <span className="size-4 shrink-0" />}
                      <span>{phone}</span>
                    </a>
                  </li>
                );
              })}
              {emails.map((email, index) => (
                <li key={email}>
                  <a href={`mailto:${email}`} className="flex gap-2.5 transition hover:text-white">
                    {index === 0 ? <Mail className="mt-0.5 size-4 shrink-0 text-white" /> : <span className="size-4 shrink-0" />}
                    <span>{email}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-5">
          <p className="text-center text-sm text-white/60">
            © {year} {tf("school")}. {tf("rights")}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-igqs-gold hover:text-igqs-ink"
            aria-label={tf("top")}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
