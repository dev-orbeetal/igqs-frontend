import { getTranslations, setRequestLocale } from "next-intl/server";
import { ClassFeeEditor } from "@/components/staff/ClassFeeEditor";
import { PaymentsNav } from "@/components/staff/PaymentsNav";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffFeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("staff");

  return (
    <StaffShell>
      <p className="text-xs uppercase tracking-[0.28em] text-igqs-gold">{t("kicker")}</p>
      <h1 className="mt-2 font-display text-4xl">{t("fees")}</h1>
      <PaymentsNav />
      <div className="mt-8">
        <ClassFeeEditor />
      </div>
    </StaffShell>
  );
}
