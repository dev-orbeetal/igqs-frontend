"use client";

import { useTranslations } from "next-intl";
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
  return (
    <div className="grid gap-4">
      {fields.map((field) => {
        if (field.type === "pair") {
          const en = String(values[`${field.name}_en`] ?? "");
          const bn = String(values[`${field.name}_bn`] ?? "");
          const Control = field.textarea ? "textarea" : "input";
          return (
            <div key={field.name} className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                {field.label} ({englishLabel})
                <Control
                  className={fieldClass}
                  rows={field.textarea ? 4 : undefined}
                  value={en}
                  onChange={(event) =>
                    setValue(values, `${field.name}_en`, event.currentTarget.value, onChange)
                  }
                />
              </label>
              <label className="text-sm">
                {field.label} ({bengaliLabel})
                <Control
                  className={fieldClass}
                  rows={field.textarea ? 4 : undefined}
                  value={bn}
                  onChange={(event) =>
                    setValue(values, `${field.name}_bn`, event.currentTarget.value, onChange)
                  }
                />
              </label>
            </div>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(event) => setValue(values, field.name, event.currentTarget.checked, onChange)}
              />
              {field.label}
            </label>
          );
        }

        if (field.type === "select") {
          const raw = values[field.name];
          const current = raw === null || raw === undefined ? "" : String(raw);
          return (
            <label key={field.name} className="text-sm">
              {field.label}
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
            </label>
          );
        }

        if (field.type === "image") {
          const urlValue = String(values[field.name] ?? "");
          const fileValue = values[field.fileName];
          const clearing = Boolean(values[`clear_${field.fileName}`]);
          const preview =
            fileValue instanceof File
              ? URL.createObjectURL(fileValue)
              : !clearing && typeof fileValue === "string" && fileValue
                ? fileValue
                : urlValue;
          const hasUpload =
            fileValue instanceof File || (!clearing && typeof fileValue === "string" && fileValue.length > 0);
          return (
            <div key={field.name} className="grid gap-3">
              <p className="text-sm font-medium">{field.label}</p>
              {preview && (
                <img src={preview} alt="" className="h-28 w-40 rounded-xl object-cover" />
              )}
              <label className="text-sm">
                {t("imageUrl")}
                <input
                  type="url"
                  className={fieldClass}
                  value={urlValue}
                  placeholder="https://"
                  onChange={(event) => setValue(values, field.name, event.currentTarget.value, onChange)}
                />
              </label>
              <div className="text-sm">
                {t("uploadImage")}
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
              {hasUpload && (
                <button
                  type="button"
                  className="w-fit text-sm text-red-700 underline"
                  onClick={() =>
                    onChange({
                      ...values,
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

        if (field.type === "datetime") {
          return (
            <label key={field.name} className="text-sm">
              {field.label}
              <input
                type="datetime-local"
                className={fieldClass}
                value={toDateTimeLocal(String(values[field.name] ?? ""))}
                onChange={(event) => setValue(values, field.name, event.currentTarget.value, onChange)}
              />
            </label>
          );
        }

        const inputType = field.type === "number" ? "number" : field.type === "url" ? "url" : "text";
        return (
          <label key={field.name} className="text-sm">
            {field.label}
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
          </label>
        );
      })}
    </div>
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
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-igqs-green px-5 py-2 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {saving ? savingLabel : saveLabel}
      </button>
      {onDelete && (
        <button
          type="button"
          disabled={saving}
          onClick={onDelete}
          className="rounded-full border border-red-400 px-5 py-2 text-sm text-red-700 disabled:opacity-40"
        >
          {deleteLabel}
        </button>
      )}
      {saved && <span className="text-sm text-emerald-700">{savedLabel}</span>}
    </div>
  );
}
