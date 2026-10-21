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
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { isAdminHost } from "@/lib/admin-paths";
import { apiGet, type SiteSettings } from "@/lib/api";
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
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://igqsbd.com"),
    // Pages set their own title; this is the fallback and the suffix.
    title: { default: title, template: `%s — ${title}` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      locale: locale === "bn" ? "bn_BD" : "en_US",
      images: [{ url: "/brand/igqs-logo-256.png", width: 256, height: 249, alt: title }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/brand/igqs-logo-256.png"],
    },
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
