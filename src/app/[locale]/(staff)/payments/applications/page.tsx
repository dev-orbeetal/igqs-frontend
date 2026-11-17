import { setRequestLocale } from "next-intl/server";
import { StaffApplicationList } from "@/features/staff/applications/StaffApplicationList";

export default async function StaffPaymentsApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StaffApplicationList />;
}
