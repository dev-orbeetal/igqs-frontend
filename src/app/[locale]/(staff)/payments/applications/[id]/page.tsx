import { setRequestLocale } from "next-intl/server";
import { StaffApplicationReview } from "@/features/staff/applications/StaffApplicationReview";

export default async function StaffPaymentApplicationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <StaffApplicationReview applicationId={id} />;
}
