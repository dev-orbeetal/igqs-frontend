import type { AboutPayload, AdmissionInfo, HomePayload, SiteSettings } from "@/lib/api/types";
import { groupAdmission } from "@/lib/prose";

export function imageName(url: string) {
  const path = url.split("?")[0].split("#")[0];
  const name = path.split("/").pop() ?? "";
  try {
    return decodeURIComponent(name).toLowerCase();
  } catch {
    return name.toLowerCase();
  }
}

export function uniqueHeroImages(urls: Array<string | undefined>) {
  const seen = new Set<string>();
  const images: string[] = [];
  for (const url of urls) {
    if (!url) continue;
    const key = imageName(url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    images.push(url);
  }
  return images;
}

export function filled(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const text = (value ?? "").trim();
    if (text) return text;
  }
  return "";
}

export type HomeCopy = {
  messages: string;
  chairman: string;
  principal: string;
  procedureSteps: string[];
};

export function buildHomeContent(
  home: HomePayload | null,
  site: SiteSettings | null,
  aboutPage: AboutPayload | null,
  admission: AdmissionInfo | null,
  copy: HomeCopy,
) {
  const content = home?.home;
  const sections = home?.sections ?? [];
  const whyChoose = home?.why_choose ?? [];
  const highlights = home?.highlights ?? [];
  const testimonials = home?.testimonials ?? [];
  const grades = home?.curriculum_highlights ?? [];
  const events = home?.upcoming_events ?? [];
  const news = home?.latest_news ?? [];
  const albums = home?.gallery ?? [];
  const notices = home?.notices ?? [];
  const noticeSlugs = new Set(notices.map((notice) => notice.slug));
  const newsItems = news.filter((item) => !noticeSlugs.has(item.slug));
  const heroImages = uniqueHeroImages([content?.hero_image_url, ...(home?.hero_images ?? [])]);
  const goals = filled(content?.goals, content?.about_preview);
  const beacon = filled(content?.beacon, content?.welcome);
  const dreams = filled(content?.dreams);
  const gain = filled(content?.child_gain);
  const holistic = filled(content?.holistic);
  const proceduresNote = filled(content?.admission_procedures);
  const announcement = (site?.admission_announcement ?? "").trim();
  const announcementIsRules = Boolean(announcement && groupAdmission(announcement));
  const proceduresAreRules = Boolean(proceduresNote && groupAdmission(proceduresNote));
  const tuition = filled(content?.tuition);
  const uniform = filled(content?.uniform);
  const vision = filled(aboutPage?.about?.vision);
  const mission = filled(aboutPage?.about?.mission);
  const facilities = aboutPage?.facilities ?? [];
  const fees = admission?.fees ?? [];
  const methods = admission?.methods ?? [];
  const chairmanShown = Boolean(content?.chairman_message || content?.chairman_name || content?.chairman_photo_url);
  const principalShown = Boolean(content?.principal_message || content?.principal_name || content?.principal_photo_url);
  const messageHeading = chairmanShown && principalShown ? copy.messages : chairmanShown ? copy.chairman : copy.principal;
  return {
    content,
    sections,
    whyChoose,
    highlights,
    testimonials,
    grades,
    events,
    albums,
    notices,
    newsItems,
    heroImages,
    goals,
    beacon,
    dreams,
    gain,
    holistic,
    proceduresNote,
    announcement,
    announcementIsRules,
    proceduresAreRules,
    tuition,
    uniform,
    vision,
    mission,
    facilities,
    fees,
    methods,
    messageHeading,
    procedureSteps: copy.procedureSteps,
  };
}
