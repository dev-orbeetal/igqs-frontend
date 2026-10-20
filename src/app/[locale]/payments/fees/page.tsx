import { redirect } from "@/i18n/navigation";

// Class fees now live on the Curriculum page, alongside the rest of that
// class's details — keeps old bookmarks/links working.
export default async function StaffFeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/content/curriculum", locale });
}
