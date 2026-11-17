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
