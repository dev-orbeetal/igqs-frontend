import { setRequestLocale } from "next-intl/server";
import { StaffApplicationReview } from "@/components/staff/StaffApplicationReview";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffPaymentApplicationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <StaffShell>
      <StaffApplicationReview applicationId={id} />
    </StaffShell>
  );
}
