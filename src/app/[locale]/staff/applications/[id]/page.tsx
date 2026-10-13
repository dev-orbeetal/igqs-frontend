import { redirect } from "@/i18n/navigation";

export default async function StaffApplicationRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect({ href: `/staff/payments/applications/${id}`, locale });
}