import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YoutubeIcon } from "@/components/icons/Social";
import { PageHero } from "@/components/ui/PageHero";
import { apiGet, type SiteSettings } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/contact" } };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const site = await apiGet<SiteSettings>("/api/site/", locale);

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-igqs-gold/20 bg-white p-6 dark:bg-[#0d1f18]">
            <p className="flex gap-3 text-sm">
              <MapPin className="mt-0.5 h-5 w-5 text-igqs-gold" />
              <span>
                <strong className="block">{t("address")}</strong>
                {site?.address}
              </span>
            </p>
            {/* Phone and email are the primary actions on this page — they
                must be tappable, not plain text. */}
            <div className="mt-4 flex gap-3 text-sm">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-igqs-forest dark:text-igqs-gold" />
              <div>
                <strong className="block">{t("phone")}</strong>
                {[site?.phone_primary, site?.phone_secondary]
                  .filter((value): value is string => Boolean(value))
                  .map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\D/g, "") ? `+${phone.replace(/\D/g, "")}` : phone}`}
                      className="flex min-h-11 items-center underline-offset-2 hover:underline"
                    >
                      {phone}
                    </a>
                  ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3 text-sm">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-igqs-forest dark:text-igqs-gold" />
              <div>
                <strong className="block">{t("email")}</strong>
                {site?.email && (
                  <a
                    href={`mailto:${site.email}`}
                    className="flex min-h-11 items-center break-all underline-offset-2 hover:underline"
                  >
                    {site.email}
                  </a>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm">
              <strong className="block">{t("hours")}</strong>
              {site?.office_hours}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                site?.facebook_url ? { href: site.facebook_url, label: t("facebook"), Icon: FacebookIcon } : null,
                site?.youtube_url ? { href: site.youtube_url, label: t("youtube"), Icon: YoutubeIcon } : null,
                site?.instagram_url ? { href: site.instagram_url, label: t("instagram"), Icon: InstagramIcon } : null,
                site?.whatsapp_url ? { href: site.whatsapp_url, label: "WhatsApp", Icon: WhatsAppIcon } : null,
              ]
                .filter((item): item is { href: string; label: string; Icon: typeof FacebookIcon } => Boolean(item))
                .map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-igqs-gold/40 text-igqs-forest transition hover:bg-igqs-gold/15 dark:text-igqs-gold"
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
            </div>
          </div>
          {site?.map_embed_url && (
            <iframe
              title={t("map")}
              src={site.map_embed_url}
              className="h-72 w-full rounded-3xl border-0"
              loading="lazy"
            />
          )}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
