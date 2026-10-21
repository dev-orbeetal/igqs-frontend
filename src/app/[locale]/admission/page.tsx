import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdmissionForm } from "@/components/admission/AdmissionForm";
import { PageIntro } from "@/components/seo/PageIntro";
import { Link } from "@/i18n/navigation";
import { apiGet, type AdmissionInfo, type SiteSettings } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admission" });
  return publicPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/admission",
  });
}

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admission");
  const tn = await getTranslations("nav");
  const [classes, site, info] = await Promise.all([
    apiGet<{ slug: string; name: string }[]>("/api/admissions/classes/", locale),
    apiGet<SiteSettings>("/api/site/", locale),
    apiGet<AdmissionInfo>("/api/admissions/info/", locale),
  ]);

  return (
    <div>
      <PageIntro
        title={t("title")}
        subtitle={t("subtitle")}
        crumbs={[
          { name: tn("home"), path: "/" },
          { name: t("title"), path: "/admission" },
        ]}
      />
      <div className="mx-auto max-w-xl px-4 py-8 sm:max-w-2xl sm:px-6 sm:py-12">
        {site?.admission_announcement && (
          <p className="mb-6 rounded-2xl border border-igqs-gold/30 bg-igqs-sand/40 p-4 text-sm dark:bg-white/5">
            {site.admission_announcement}
          </p>
        )}
        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-igqs-muted">
          <Link href="/admission/payments" className="text-igqs-forest underline dark:text-igqs-gold">
            {tn("myPayments")}
          </Link>
          <Link href="/admission/receipt" className="text-igqs-forest underline dark:text-igqs-gold">
            {t("downloadPageTitle")}
          </Link>
        </div>
        <AdmissionForm classes={classes ?? []} info={info} />
      </div>
    </div>
  );
}
