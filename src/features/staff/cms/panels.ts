export const HOME_PANELS = ["story", "practical", "highlights", "page", "people", "why", "testimonials"] as const;
export type HomePanel = (typeof HOME_PANELS)[number];

export const ABOUT_PANELS = ["leadership", "directors", "teachers", "advisors", "facilities"] as const;
export type AboutPanel = (typeof ABOUT_PANELS)[number];

export const ADMISSION_PANELS = ["fees", "payments"] as const;
export type AdmissionPanel = (typeof ADMISSION_PANELS)[number];

export const CURRICULUM_PANELS = ["subjects", "documents"] as const;
export type CurriculumPanel = (typeof CURRICULUM_PANELS)[number];

export const GALLERY_PANELS = ["images"] as const;
export type GalleryPanel = (typeof GALLERY_PANELS)[number];

export function isPanel<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value);
}
