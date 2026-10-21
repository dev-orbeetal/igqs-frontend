import { Cormorant_Garamond, Outfit } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HideOnStaff } from "@/components/layout/HideOnStaff";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { isAdminHost } from "@/lib/admin-paths";
import { apiGet, type SiteSettings } from "@/lib/api";
import { SITE_ORIGIN, siteGraph } from "@/lib/seo";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

const bornomala = localFont({
  src: [
    { path: "../../fonts/Bornomala-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/Bornomala-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-bornomala",
  display: "swap",
  adjustFontFallback: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  const metadataBase = new URL(SITE_ORIGIN);
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  // The admin host serves the staff dashboard at /. It must not inherit the
  // public homepage canonical or an indexable description.
  if (isAdminHost(await headers())) {
    return {
      metadataBase,
      title: { default: title, template: `%s — ${title}` },
      robots: { index: false, follow: false },
    };
  }
  return {
    metadataBase,
    // Pages set their own title; this is the fallback and the suffix.
    title: { default: title, template: `%s — ${title}` },
    description,
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      locale: locale === "bn" ? "bn_BD" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(google ? { verification: { google } } : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const a11y = await getTranslations({ locale, namespace: "a11y" });
  const adminSite = isAdminHost(await headers());
  const site = await apiGet<SiteSettings>("/api/site/", locale);

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} ${cormorant.variable} ${bornomala.variable} ${
          locale === "bn" ? "font-bn" : "font-sans"
        }`}
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {!adminSite && site?.school_name ? <JsonLd data={siteGraph(site)} /> : null}
            {!adminSite ? <GoogleAnalytics /> : null}
            <HideOnStaff adminSite={adminSite}>
              <a href="#main" className="skip-link">
                {a11y("skipToContent")}
              </a>
            </HideOnStaff>
            <Header adminSite={adminSite} />
            <main id="main">{children}</main>
            <HideOnStaff adminSite={adminSite}>
              <Footer site={site} />
            </HideOnStaff>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
