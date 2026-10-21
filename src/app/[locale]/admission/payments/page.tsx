import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MyPaymentsPanel } from "@/components/admission/MyPaymentsPanel";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero } from "@/components/ui/PageHero";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admission" });
  return {
    ...publicPageMetadata({
      title: t("myPaymentsTitle"),
      description: t("myPaymentsSubtitle"),
      path: "/admission/payments",
    }),
    robots: { index: false, follow: false },
  };
}

export default async function MyPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admission");

  return (
    <div>
      <PageHero title={t("myPaymentsTitle")} subtitle={t("myPaymentsSubtitle")} />
      <FadeIn className="mx-auto max-w-xl px-4 py-8 sm:max-w-2xl sm:px-6 sm:py-12">
        <MyPaymentsPanel />
      </FadeIn>
    </div>
  );
}
