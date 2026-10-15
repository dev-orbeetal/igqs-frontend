import { setRequestLocale } from "next-intl/server";
import { ClassFeeEditor } from "@/components/staff/ClassFeeEditor";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffFeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaffShell>
      <ClassFeeEditor />
    </StaffShell>
  );
}
