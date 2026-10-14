import { setRequestLocale } from "next-intl/server";
import { ContentHub } from "@/components/staff/cms/editors";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaffShell>
      <ContentHub />
    </StaffShell>
  );
}
