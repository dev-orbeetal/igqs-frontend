import { setRequestLocale } from "next-intl/server";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StaffShell>
      <StaffDashboard />
    </StaffShell>
  );
}
