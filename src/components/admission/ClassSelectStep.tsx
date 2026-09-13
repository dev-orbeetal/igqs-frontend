"use client";

import { useTranslations } from "next-intl";
import type { AdmissionFeeInfo, ClassOption } from "@/lib/api";
import { ADMISSION_CLASS_SLUGS, CLASS_LABEL_KEYS, type AdmissionClassSlug } from "./fields";

export function ClassSelectStep({
  classes,
  selectedSlug,
  fee,
  onSelect,
}: {
  classes: ClassOption[];
  selectedSlug: string;
  fee: AdmissionFeeInfo | null;
  onSelect: (option: ClassOption) => void;
}) {
  const t = useTranslations("admission");
  const bySlug = new Map(classes.map((item) => [item.slug, item]));

  return (
    <div>
      <h2 className="font-display text-2xl leading-snug sm:text-3xl">{t("classSelectHeading")}</h2>
      <p className="mt-2 text-sm text-igqs-muted">{t("classRangeHint")}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ADMISSION_CLASS_SLUGS.map((slug) => {
          const option = bySlug.get(slug);
          if (!option) return null;
          const active = selectedSlug === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelect(option)}
              className={`min-h-16 rounded-2xl border px-3 py-4 text-center text-base font-medium transition ${
                active
                  ? "border-igqs-gold bg-igqs-gold/20 text-igqs-green dark:text-igqs-gold-soft"
                  : "border-igqs-gold/30 bg-white dark:bg-[#0d1f18]"
              }`}
            >
              {t(CLASS_LABEL_KEYS[slug as AdmissionClassSlug])}
            </button>
          );
        })}
      </div>
      {selectedSlug && fee && (
        <div className="mt-6 rounded-3xl bg-igqs-green px-5 py-6 text-center text-igqs-cream dark:bg-[#0b241c]">
          <p className="text-sm text-igqs-gold-soft">{t("feeFixed")}</p>
          <p className="mt-2 font-display text-4xl">৳{Number(fee.amount).toLocaleString("en-BD")}</p>
        </div>
      )}
    </div>
  );
}
