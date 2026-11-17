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
  MessagesManager,
  NewsManager,
} from "@/features/staff/cms";

const sections = {
  home: HomeEditor,
  about: AboutEditor,
  contact: ContactEditor,
  messages: MessagesManager,
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

  return <Editor />;
}
