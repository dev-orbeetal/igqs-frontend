import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  CurriculumManager,
  EventsManager,
  GalleryManager,
  NewsManager,
} from "@/components/staff/cms/editors";
import { StaffShell } from "@/components/staff/StaffShell";

const sections = {
  events: EventsManager,
  news: NewsManager,
  curriculum: CurriculumManager,
  gallery: GalleryManager,
} as const;

export default async function StaffContentItemPage({
  params,
}: {
  params: Promise<{ locale: string; section: string; id: string }>;
}) {
  const { locale, section, id } = await params;
  setRequestLocale(locale);
  const Editor = sections[section as keyof typeof sections];
  if (!Editor) notFound();

  return (
    <StaffShell>
      <Editor id={id} />
    </StaffShell>
  );
}
