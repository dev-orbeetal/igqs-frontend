"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("a11y");
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = (next: "en" | "bn") => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex items-center gap-0.5 text-sm font-medium sm:gap-1" role="group" aria-label={t("language")}>
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={`rounded-full px-2.5 py-1 transition-colors duration-200 ${
          locale === "bn"
            ? "bg-igqs-green text-white dark:bg-igqs-gold dark:text-igqs-ink"
            : "text-igqs-ink/70 hover:text-igqs-green dark:text-igqs-cream/70"
        }`}
      >
        বাংলা
      </button>
      <span className="text-igqs-gold/70">|</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-2.5 py-1 transition-colors duration-200 ${
          locale === "en"
            ? "bg-igqs-green text-white dark:bg-igqs-gold dark:text-igqs-ink"
            : "text-igqs-ink/70 hover:text-igqs-green dark:text-igqs-cream/70"
        }`}
      >
        English
      </button>
    </div>
  );
}
