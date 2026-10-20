"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { fieldClass, toDateTimeLocal, type CmsField } from "@/lib/cms";

function setValue(
  values: Record<string, unknown>,
  name: string,
  value: unknown,
  onChange: (next: Record<string, unknown>) => void
) {
  onChange({ ...values, [name]: value });
}

function Hint({ id }: { id?: string }) {
  const t = useTranslations("cms");
  if (!id) return null;
  return <p className="mt-1 text-xs leading-relaxed text-igqs-muted">{t(id)}</p>;
}

export function LangMark({ code, label }: { code: "en" | "bn"; label: string }) {
  const tone =
    code === "en"
      ? "bg-igqs-green/10 text-igqs-green dark:bg-igqs-gold/15 dark:text-igqs-gold-soft"
      : "bg-igqs-gold/20 text-igqs-ink dark:text-igqs-gold-soft";
  return (
    <span className="mb-1 flex items-center gap-2 text-xs font-semibold">
      <span className={`rounded-full px-2 py-0.5 uppercase tracking-wide ${tone}`}>{code}</span>
      {label}
    </span>
  );
}

function FieldShell({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-igqs-ink dark:text-igqs-sand">
      {label}
      <Hint id={hint} />
      {children}
    </label>
  );
}

function ImageControl({
  field,
  values,
  onChange,
}: {
  field: Extract<CmsField, { type: "image" }>;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const t = useTranslations("cms");
  const fileValue = values[field.fileName];
  const clearing = Boolean(values[`clear_${field.fileName}`]);
  const stored = clearing ? "" : String(values[field.name] ?? "");
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    if (!(fileValue instanceof File)) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(fileValue);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileValue]);

  const preview =
    objectUrl ||
    (!clearing && typeof fileValue === "string" && fileValue ? fileValue : stored);

  return (
    <div className="rounded-2xl border border-dashed border-igqs-gold/50 bg-white p-4 dark:bg-[#10261e]">
      <p className="text-sm font-semibold">{field.label}</p>
      <p className="mt-1 text-xs leading-relaxed text-igqs-muted">{t("uploadImageHint")}</p>
      {preview ? (
        <img src={preview} alt="" className="mt-3 h-40 w-full max-w-xs rounded-xl object-cover" />
      ) : (
        <p className="mt-3 rounded-xl bg-igqs-sand/60 px-3 py-6 text-center text-sm text-igqs-muted dark:bg-white/5">
          {t("imageEmpty")}
        </p>
      )}
      <div className="mt-3">
        <ImageFileInput
          onChange={(file) =>
            onChange({
              ...values,
              [field.fileName]: file ?? "",
              [`clear_${field.fileName}`]: false,
            })
          }
        />
      </div>
      {preview && (
        <button
          type="button"
          className={`mt-3 w-fit ${btn.danger}`}
          onClick={() =>
            onChange({
              ...values,
              [field.name]: "",
              [field.fileName]: "",
              [`clear_${field.fileName}`]: true,
            })
          }
        >
          {t("removeUpload")}
        </button>
      )}
    </div>
  );
}

function CmsControl({
  field,
  values,
  onChange,
  englishLabel,
  bengaliLabel,
}: {
  field: CmsField;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  englishLabel: string;
  bengaliLabel: string;
}) {
  if (field.type === "pair") {
    const Control = field.textarea ? "textarea" : "input";
    return (
      <div className="rounded-2xl border border-igqs-gold/20 bg-white p-4 dark:bg-[#10261e]">
        <p className="text-sm font-semibold">{field.label}</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <LangMark code="en" label={englishLabel} />
            <Control
              className={field.textarea ? `${fieldClass} min-h-28` : fieldClass}
              rows={field.textarea ? 4 : undefined}
              value={String(values[`${field.name}_en`] ?? "")}
              onChange={(event) => setValue(values, `${field.name}_en`, event.currentTarget.value, onChange)}
            />
          </label>
          <label className="text-sm">
            <LangMark code="bn" label={bengaliLabel} />
            <Control
              className={field.textarea ? `${fieldClass} min-h-28` : fieldClass}
              rows={field.textarea ? 4 : undefined}
              value={String(values[`${field.name}_bn`] ?? "")}
              onChange={(event) => setValue(values, `${field.name}_bn`, event.currentTarget.value, onChange)}
            />
          </label>
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-start gap-3 rounded-2xl border border-igqs-gold/20 bg-white px-4 py-3 text-sm dark:bg-[#10261e]">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-igqs-green"
          checked={Boolean(values[field.name])}
          onChange={(event) => setValue(values, field.name, event.currentTarget.checked, onChange)}
        />
        <span className="font-medium">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    const raw = values[field.name];
    const current = raw === null || raw === undefined ? "" : String(raw);
    return (
      <FieldShell label={field.label} hint={field.hint}>
        <select
          className={fieldClass}
          value={current}
          onChange={(event) =>
            setValue(values, field.name, event.currentTarget.value === "" ? null : event.currentTarget.value, onChange)
          }
        >
          <option value="">—</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>
    );
  }

  if (field.type === "image") {
    return <ImageControl field={field} values={values} onChange={onChange} />;
  }

  if (field.type === "datetime") {
    return (
      <FieldShell label={field.label} hint={field.hint}>
        <input
          type="datetime-local"
          className={fieldClass}
          value={toDateTimeLocal(String(values[field.name] ?? ""))}
          onChange={(event) => setValue(values, field.name, event.currentTarget.value, onChange)}
        />
      </FieldShell>
    );
  }

  const inputType = field.type === "number" ? "number" : field.type === "url" ? "url" : "text";
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <input
        type={inputType}
        className={fieldClass}
        value={String(values[field.name] ?? "")}
        onChange={(event) =>
          setValue(
            values,
            field.name,
            field.type === "number" ? Number(event.currentTarget.value) : event.currentTarget.value,
            onChange
          )
        }
      />
    </FieldShell>
  );
}

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
  englishLabel,
  bengaliLabel,
}: {
  fields: CmsField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
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

export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  if (sections.length < 2) return null;
  return (
    <nav
      aria-label="Page sections"
      className="sticky top-0 z-10 -mx-4 mb-6 flex gap-2 overflow-x-auto border-b border-igqs-gold/20 bg-[#f4f7fb]/95 px-4 py-2.5 backdrop-blur dark:bg-[#07140f]/95 sm:-mx-6 sm:px-6"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="shrink-0 whitespace-nowrap rounded-full border border-igqs-gold/30 px-3.5 py-1.5 text-xs font-medium text-igqs-ink transition hover:border-igqs-gold hover:bg-igqs-gold/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igqs-gold dark:text-igqs-sand"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

export function FormActions({
  saving,
  saveLabel,
  savingLabel,
  savedLabel,
  deleteLabel,
  onDelete,
  saved,
}: {
  saving: boolean;
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
      {saved && <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{savedLabel}</span>}
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
