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

const shadhinata = localFont({
  src: [
    {
      path: "../../fonts/LiShadhinata-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/LiShadhinata-Regular.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/LiShadhinata-Regular.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/LiShadhinata-Regular.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/LiShadhinata-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-shadhinata",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  return {
    title: t("title"),
    description: t("description"),
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
  const adminSite = isAdminHost(await headers());
  const site = await apiGet<SiteSettings>("/api/site/", locale);

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} ${cormorant.variable} ${shadhinata.variable} ${
          locale === "bn" ? "font-bn" : "font-sans"
        }`}
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Header site={site} adminSite={adminSite} />
            <main>{children}</main>
            <HideOnStaff adminSite={adminSite}>
              <Footer site={site} />
            </HideOnStaff>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
