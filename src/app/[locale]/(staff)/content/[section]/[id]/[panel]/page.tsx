import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CurriculumManager } from "@/features/staff/cms/CurriculumManager";
import { GalleryManager } from "@/features/staff/cms/GalleryManager";
import { CURRICULUM_PANELS, GALLERY_PANELS, isPanel } from "@/features/staff/cms/panels";

export default async function StaffContentPanelPage({
  params,
}: {
  params: Promise<{ locale: string; section: string; id: string; panel: string }>;
}) {
  const { locale, section, id, panel } = await params;
  setRequestLocale(locale);
  if (id === "new") notFound();

  if (section === "curriculum" && isPanel(panel, CURRICULUM_PANELS)) {
    return <CurriculumManager id={id} panel={panel} />;
  }
  if (section === "gallery" && isPanel(panel, GALLERY_PANELS)) {
    return <GalleryManager id={id} panel={panel} />;
  }

  notFound();
}
