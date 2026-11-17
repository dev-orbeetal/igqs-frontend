"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { btn } from "@/components/ui/button-styles";
import { Link, usePathname } from "@/i18n/navigation";
import { fieldKeys } from "@/lib/cms/payload";
import type { CmsField } from "@/lib/cms/types";
import { CmsControl } from "./CmsControl";
import type { FieldErrors } from "./types";

export type { FieldErrors };
export { LangMark } from "./CmsControl";

function groupFields(fields: CmsField[]) {
  const groups: { section?: string; fields: CmsField[] }[] = [];
  for (const field of fields) {
    const last = groups[groups.length - 1];
    if (!last || last.section !== field.section) groups.push({ section: field.section, fields: [field] });
    else last.fields.push(field);
  }
  return groups;
}

export function CmsFields({
  fields,
  values,
  onChange,
  errors = {},
  englishLabel,
  bengaliLabel,
}: {
  fields: CmsField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  errors?: FieldErrors;
  englishLabel: string;
  bengaliLabel: string;
}) {
  const t = useTranslations("cms");
  const groups = groupFields(fields);
  const grouped = groups.some((group) => group.section);

  return (
    <div className="grid gap-4">
      {groups.map((group, index) => (
        <section
          key={group.section ?? `fields-${index}`}
          className={grouped ? "rounded-2xl bg-igqs-sand/50 p-4 dark:bg-white/[0.04]" : "grid gap-4"}
        >
          {group.section && (
            <h3 className="mb-3 font-display text-xl text-igqs-green dark:text-igqs-gold-soft">{t(group.section)}</h3>
          )}
          <div className="grid gap-4">
            {group.fields.map((field) => (
              <CmsControl
                key={field.name}
                field={field}
                values={values}
                onChange={onChange}
                errors={errors}
                englishLabel={englishLabel}
                bengaliLabel={bengaliLabel}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Field errors the form could not place under a control — an unknown field
 *  name, or a change to the serializer the panel has not caught up with. */
export function unplacedErrors(fields: CmsField[], errors: FieldErrors) {
  const known = new Set(fields.flatMap(fieldKeys));
  return Object.entries(errors).filter(([key]) => !known.has(key));
}

export function SectionNav({ sections }: { sections: { id: string; label: string; href: string }[] }) {
  const pathname = usePathname();
  if (sections.length < 2) return null;
  return (
    <nav
      aria-label="Page sections"
      className="sticky top-0 z-10 -mx-4 mb-6 flex gap-2 overflow-x-auto border-b border-igqs-gold/20 bg-[#f4f7fb]/95 px-4 py-2.5 backdrop-blur dark:bg-[#07140f]/95 sm:-mx-6 sm:px-6"
    >
      {sections.map((section) => {
        const active = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igqs-gold ${
              active
                ? "border-igqs-green bg-igqs-green text-white dark:border-igqs-gold dark:bg-igqs-gold dark:text-igqs-ink"
                : "border-igqs-border-strong text-igqs-ink hover:border-igqs-gold hover:bg-igqs-gold/15 dark:text-igqs-sand"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FormActions({
  saving,
  dirty,
  saveLabel,
  savingLabel,
  savedLabel,
  deleteLabel,
  onDelete,
  saved,
}: {
  saving: boolean;
  dirty?: boolean;
  saveLabel: string;
  savingLabel: string;
  savedLabel: string;
  deleteLabel?: string;
  onDelete?: () => void;
  saved: boolean;
}) {
  const t = useTranslations("cms");
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-igqs-gold/20 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
      <button type="submit" disabled={saving} className={`${btn.primary} min-h-11`}>
        {saving ? savingLabel : saveLabel}
      </button>
      {onDelete && (
        <button type="button" disabled={saving} onClick={() => setConfirming(true)} className={`${btn.danger} min-h-11`}>
          {deleteLabel}
        </button>
      )}
      {/* Announced, and it stops claiming "Saved" the moment the form is
          edited again — it used to stay up while holding unsaved changes. */}
      <span aria-live="polite" className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
        {saved && !dirty ? savedLabel : ""}
      </span>
      {dirty && !saving && (
        <span className="text-sm text-igqs-muted">{t("unsavedChanges")}</span>
      )}
      <ConfirmDialog
        open={confirming}
        title={t("confirmTitle")}
        message={t("confirmDelete")}
        confirmLabel={deleteLabel || t("delete")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onDelete?.();
        }}
      />
    </div>
  );
}
