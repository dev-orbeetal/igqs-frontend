import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import {
  CurriculumManager,
  EventsManager,
  GalleryManager,
  NewsManager,
} from "@/features/staff/cms";
import { AboutEditor } from "@/features/staff/cms/AboutEditor";
import { AdmissionEditor } from "@/features/staff/cms/AdmissionEditor";
import { HomeEditor } from "@/features/staff/cms/HomeEditor";
import { ABOUT_PANELS, ADMISSION_PANELS, HOME_PANELS, isPanel } from "@/features/staff/cms/panels";

const records = {
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

  if (section === "home" && (id === "hero" || id === "slides")) {
    redirect({ href: "/content/home", locale });
  }
  if (section === "home" && isPanel(id, HOME_PANELS)) {
    return <HomeEditor panel={id} />;
  }
  if (section === "about" && isPanel(id, ABOUT_PANELS)) {
    return <AboutEditor panel={id} />;
  }
  if (section === "admission" && isPanel(id, ADMISSION_PANELS)) {
    return <AdmissionEditor panel={id} />;
  }

  const Editor = records[section as keyof typeof records];
  if (!Editor) notFound();

  return <Editor id={id} />;
}
