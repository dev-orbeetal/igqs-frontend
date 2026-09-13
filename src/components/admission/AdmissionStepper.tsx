"use client";

import { useTranslations } from "next-intl";

const STEP_KEYS = ["stepClass", "stepInformation", "stepVerify", "stepPayment", "stepReceipt"] as const;

export function AdmissionStepper({
  step,
  receiptReady,
}: {
  step: number;
  receiptReady: boolean;
}) {
  const t = useTranslations("admission");

  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1 text-xs sm:gap-2 sm:text-sm">
      {STEP_KEYS.map((key, index) => {
        const current = index === step;
        const done = index < step || (index === 4 && receiptReady);
        return (
          <li key={key} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div
              className={`flex min-h-10 w-full items-center justify-center rounded-full px-2 py-2 text-center leading-tight ${
                current
                  ? "bg-igqs-green text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                  : done
                    ? "bg-igqs-gold/20 text-igqs-green dark:text-igqs-gold-soft"
                    : "bg-igqs-sand/80 text-igqs-muted dark:bg-white/5"
              }`}
            >
              <span className="truncate">{t(key)}</span>
            </div>
            {index < STEP_KEYS.length - 1 && (
              <span className="hidden text-igqs-gold/70 sm:inline" aria-hidden>
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
