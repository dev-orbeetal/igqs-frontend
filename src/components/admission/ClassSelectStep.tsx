"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AdmissionFeeInfo, ClassOption } from "@/lib/api";
import { formatAmountNumber } from "@/lib/format";

export function ClassSelectStep({
  classes,
  selectedSlug,
  fee,
  error,
  onSelect,
}: {
  classes: ClassOption[];
  selectedSlug: string;
  fee: AdmissionFeeInfo | null;
  error?: string;
  onSelect: (option: ClassOption) => void;
}) {
  const t = useTranslations("admission");
  const locale = useLocale();

  return (
    <div>
      <h2 className="font-display text-2xl leading-snug sm:text-3xl">{t("classSelectHeading")}</h2>
      <p className="mt-2 text-sm text-igqs-muted">{t("classRangeHint")}</p>
      <div
        data-field="applying_class"
        className={`mt-6 grid grid-cols-2 gap-3 rounded-2xl sm:grid-cols-3 ${error ? "ring-1 ring-red-500" : ""}`}
      >
        {classes.map((option) => {
          const active = selectedSlug === option.slug;
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => onSelect(option)}
              className={`min-h-16 rounded-2xl border px-3 py-4 text-center text-base font-medium transition ${
                active
                  ? "border-igqs-gold bg-igqs-gold/20 text-igqs-green dark:text-igqs-gold-soft"
                  : "border-igqs-gold/30 bg-white dark:bg-[#0d1f18]"
              }`}
            >
              {option.name}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
      {selectedSlug && fee && (
        <div className="mt-6 rounded-3xl bg-igqs-green px-5 py-6 text-center text-igqs-cream dark:bg-[#0b241c]">
          <p className="text-sm text-igqs-gold-soft">{t("feeFixed")}</p>
          <p className="mt-2 font-display text-4xl">৳{formatAmountNumber(fee.amount, locale)}</p>
        </div>
      )}
    </div>
  );
}
