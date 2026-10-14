import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  AboutEditor,
  AdmissionEditor,
  ContactEditor,
  CurriculumManager,
  EventsManager,
  GalleryManager,
  HomeEditor,
  NewsManager,
} from "@/components/staff/cms/editors";
import { StaffShell } from "@/components/staff/StaffShell";

const sections = {
  home: HomeEditor,
  about: AboutEditor,
  contact: ContactEditor,
  admission: AdmissionEditor,
  events: EventsManager,
  news: NewsManager,
  curriculum: CurriculumManager,
  gallery: GalleryManager,
} as const;

export default async function StaffContentSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  setRequestLocale(locale);
  const Editor = sections[section as keyof typeof sections];
  if (!Editor) notFound();

  return (
    <StaffShell>
      <Editor />
    </StaffShell>
  );
}
