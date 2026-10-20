import { redirect } from "@/i18n/navigation";

// /content had no page of its own, so trimming a URL back to it 404'd.
// The first website section stands in for an index.
export default async function StaffContentIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/content/home", locale });
}
