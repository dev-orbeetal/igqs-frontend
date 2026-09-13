export const fieldClass =
  "mt-1.5 w-full min-h-12 rounded-2xl border border-igqs-gold/30 bg-white px-4 py-3 text-base dark:bg-[#0d1f18]";

export const fieldErrorClass = "mt-1 text-sm text-red-700 dark:text-red-300";

export const ADMISSION_CLASS_SLUGS = [
  "playgroup",
  "nursery",
  "kg",
  "class-1",
  "class-2",
  "class-3",
] as const;

export type AdmissionClassSlug = (typeof ADMISSION_CLASS_SLUGS)[number];

export const CLASS_LABEL_KEYS: Record<AdmissionClassSlug, "classPlay" | "classNursery" | "classKg" | "class1" | "class2" | "class3"> = {
  playgroup: "classPlay",
  nursery: "classNursery",
  kg: "classKg",
  "class-1": "class1",
  "class-2": "class2",
  "class-3": "class3",
};

export type WizardForm = Record<string, string>;

export const DRAFT_KEY = "igqs-admission-draft";

export function loadDraft(): WizardForm {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as WizardForm) : {};
  } catch {
    return {};
  }
}

export function saveDraft(form: WizardForm) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}
