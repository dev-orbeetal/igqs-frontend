import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/seo/PageIntro";
import { AdmissionGuide } from "@/features/home/HomeSections";
import { buildHomeContent } from "@/features/home/content";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/client";
import { type AdmissionInfo, type HomePayload, type SiteSettings } from "@/lib/api/types";
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
  const common = await getTranslations("common");
  const homeCopy = await getTranslations("home");
  const [site, info, home] = await Promise.all([
    apiGet<SiteSettings>("/api/site/", locale),
    apiGet<AdmissionInfo>("/api/admissions/info/", locale),
    apiGet<HomePayload>("/api/home/", locale),
  ]);
  const guide = buildHomeContent(home, site, null, info, {
    messages: "",
    chairman: "",
    principal: "",
    procedureSteps: [1, 2, 3, 4, 5].map((step) => homeCopy(`procedure${step}`)),
  });

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
      <AdmissionGuide
        announcement={guide.announcement}
        announcementIsRules={guide.announcementIsRules}
        proceduresNote={guide.proceduresNote}
        proceduresAreRules={guide.proceduresAreRules}
        steps={guide.procedureSteps}
        methods={guide.methods}
        fees={guide.fees}
        schedules={info?.schedules ?? []}
      />
      <section className="section-cream border-t border-igqs-gold/20">
        <div className="section-shell flex flex-col items-start gap-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-12">
          <div>
            <h2 className="heading-strong text-2xl text-igqs-green dark:text-igqs-gold-soft">{t("applyTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-igqs-muted">{t("applySubtitle")}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-igqs-muted">
              <Link href="/admission/payments" className="text-igqs-forest underline dark:text-igqs-gold">
                {tn("myPayments")}
              </Link>
              <Link href="/admission/receipt" className="text-igqs-forest underline dark:text-igqs-gold">
                {t("downloadPageTitle")}
              </Link>
            </div>
          </div>
          <Link href="/admission/apply" className="btn-green btn-shine btn-sparkle inline-flex shrink-0">
            {common("applyNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
