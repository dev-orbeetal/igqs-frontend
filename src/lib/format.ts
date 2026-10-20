const NEWS_CATEGORIES = [
  "news",
  "announcement",
  "notice",
  "admission",
  "holiday",
  "exam",
  "update",
] as const;

export function newsCategoryKey(category: string) {
  return NEWS_CATEGORIES.includes(category as (typeof NEWS_CATEGORIES)[number])
    ? category
    : "news";
}

export function formatDate(iso: string, locale: string, withTime = false) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeStyle: withTime ? "short" : undefined,
  }).format(new Date(iso));
}

// Shared locale resolution for every guardian-facing amount display, so a
// page rendered in English never shows Bengali numerals (or vice versa).
export function formatAmountNumber(amount: number | string, locale: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return String(amount);
  return value.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB");
}
