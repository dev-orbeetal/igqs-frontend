import { setRequestLocale } from "next-intl/server";
import { StaffDashboard } from "@/features/staff/dashboard/StaffDashboard";

export default async function StaffDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StaffDashboard />;
}
