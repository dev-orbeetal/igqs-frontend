import { getTranslations, setRequestLocale } from "next-intl/server";
import { MyPaymentsPanel } from "@/components/admission/MyPaymentsPanel";
import { PageHero } from "@/components/ui/PageHero";

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
      <div className="mx-auto max-w-xl px-4 py-8 sm:max-w-2xl sm:px-6 sm:py-12">
        <MyPaymentsPanel />
      </div>
    </div>
  );
}
