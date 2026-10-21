import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReceiptLookupPanel } from "@/components/admission/ReceiptLookupPanel";
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
      title: t("downloadPageTitle"),
      description: t("downloadPageSubtitle"),
      path: "/admission/receipt",
    }),
    robots: { index: false, follow: false },
  };
}

export default async function DownloadReceiptPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admission");

  return (
    <div>
      <PageHero title={t("downloadPageTitle")} subtitle={t("downloadPageSubtitle")} />
      <FadeIn className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Suspense>
          <ReceiptLookupPanel />
        </Suspense>
      </FadeIn>
    </div>
  );
}
