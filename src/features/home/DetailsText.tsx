"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { groupAdmission, previewParts } from "@/lib/prose";

export const HOME_PROSE =
  "max-w-3xl whitespace-pre-line text-sm leading-relaxed text-igqs-ink/90 dark:text-igqs-sand/90";

function DetailsSummary() {
  const t = useTranslations("common");
  return (
    <summary>
      <span className="link-gold details-closed">{t("details")}</span>
      <span className="link-gold details-open">{t("closeDetails")}</span>
    </summary>
  );
}

export function Disclosure({
  children,
  className = "mt-3",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`details-toggle ${className}`}>
      <DetailsSummary />
      <div className="details-body">{children}</div>
    </details>
  );
}

export function DetailsText({
  text,
  className = "",
  preview = 1,
  unit = "sentences",
  quote = false,
}: {
  text: string;
  className?: string;
  /** Sentences or paragraphs that stay visible. */
  preview?: number;
  unit?: "sentences" | "paragraphs";
  quote?: boolean;
}) {
  const source = text.trim();
  if (!source) return null;
  const { visible, hidden } = previewParts(source, unit, preview);
  const shown = quote ? `“${visible}${hidden ? "" : "”"}` : visible;
  if (!hidden) return <p className={className}>{shown}</p>;
  const more = quote ? `${hidden}”` : hidden;
  return (
    <div>
      <p className={className}>{shown}</p>
      <details className="details-toggle mt-3">
        <DetailsSummary />
        <p className={className}>{more}</p>
      </details>
    </div>
  );
}

export function AdmissionNotes({ text }: { text: string }) {
  const t = useTranslations("home");
  const groups = groupAdmission(text);
  return (
    <Disclosure className="">
      {groups ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="heading-strong text-xl text-igqs-green dark:text-igqs-gold-soft">{t("examRules")}</h3>
            <ul className="mt-3 space-y-2">
              {groups.exams.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-igqs-ink/90 dark:text-igqs-sand/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-igqs-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="heading-strong text-xl text-igqs-green dark:text-igqs-gold-soft">{t("requiredPapers")}</h3>
            <ul className="mt-3 space-y-2">
              {groups.papers.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-igqs-ink/90 dark:text-igqs-sand/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-igqs-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className={HOME_PROSE}>{text}</p>
      )}
    </Disclosure>
  );
}
