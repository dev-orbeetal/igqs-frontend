import { redirect } from "@/i18n/navigation";

// Same as /content: /payments itself 404'd. Applications is the only thing
// under it now that class fees have moved to the Curriculum page.
export default async function StaffPaymentsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/payments/applications", locale });
}
