import { setRequestLocale } from "next-intl/server";
import { StaffApplicationList } from "@/components/staff/StaffApplicationList";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffPaymentsApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaffShell>
      <StaffApplicationList />
    </StaffShell>
  );
}
