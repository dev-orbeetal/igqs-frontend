"use client";

import { ArrowUp, ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YoutubeIcon } from "@/components/icons/Social";
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
    <Link href={href} className="group flex min-h-11 items-start gap-1.5 py-1.5 text-white/75 transition hover:text-white">
      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-white/55 transition group-hover:text-white" aria-hidden />
      <span>{label}</span>
    </Link>
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
    { label: t("notices"), href: "/notices" },
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
                  className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-igqs-gold hover:text-igqs-ink"
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
              {/* A phone number should dial. WhatsApp is offered separately in
                  the social row when the school has configured it — routing
                  every number (including the landline) to wa.me meant nobody
                  could actually call from here. */}
              {phones.map((phone, index) => (
                <li key={phone}>
                  <a
                    href={`tel:${digitsOnly(phone) ? `+${digitsOnly(phone)}` : phone}`}
                    className="flex min-h-11 items-center gap-2.5 transition hover:text-white"
                  >
                    {index === 0 ? <Phone className="size-4 shrink-0 text-white" /> : <span className="size-4 shrink-0" />}
                    <span>{phone}</span>
                  </a>
                </li>
              ))}
              {emails.map((email, index) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="flex min-h-11 items-center gap-2.5 transition hover:text-white"
                  >
                    {index === 0 ? <Mail className="size-4 shrink-0 text-white" /> : <span className="size-4 shrink-0" />}
                    <span>{email}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-5 sm:flex-row">
          <p className="text-center text-sm text-white/60">
            © {year} {tf("school")}. {tf("rights")}
          </p>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              })
            }
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-igqs-gold hover:text-igqs-ink sm:absolute sm:right-4"
            aria-label={tf("top")}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
