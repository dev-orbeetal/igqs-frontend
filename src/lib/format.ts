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
/** Dial a stored school number. A local 01… mobile becomes +8801…. */
export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return `tel:${phone}`;
  if (digits.startsWith("880")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+880${digits.slice(1)}`;
  return `tel:+${digits}`;
}

export function formatAmountNumber(amount: number | string, locale: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return String(amount);
  return value.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB");
}
