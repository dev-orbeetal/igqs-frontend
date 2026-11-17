import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { HomePage } from "@/features/home/HomePage";
import { StaffDashboard } from "@/features/staff/dashboard/StaffDashboard";
import { StaffShell } from "@/features/staff/shell/StaffShell";
import { isAdminHost } from "@/lib/admin-paths";
import { apiGet } from "@/lib/api/client";
import type { AboutPayload, AdmissionInfo, HomePayload, SiteSettings } from "@/lib/api/types";
import { NOINDEX, publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isAdminHost(await headers())) return NOINDEX;
  const t = await getTranslations({ locale, namespace: "meta" });
  return publicPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (isAdminHost(await headers())) {
    return (
      <StaffShell>
        <StaffDashboard />
      </StaffShell>
    );
  }
  const [home, site, aboutPage, admission] = await Promise.all([
    apiGet<HomePayload>("/api/home/", locale),
    apiGet<SiteSettings>("/api/site/", locale),
    apiGet<AboutPayload>("/api/about/", locale),
    apiGet<AdmissionInfo>("/api/admissions/info/", locale),
  ]);
  return <HomePage locale={locale} home={home} site={site} aboutPage={aboutPage} admission={admission} />;
}
