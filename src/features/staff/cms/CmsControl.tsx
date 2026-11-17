"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPhoto } from "@/components/ui/AdminPhoto";
import { btn } from "@/components/ui/button-styles";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import type { CmsField } from "@/lib/cms/types";
import { toDateTimeLocal } from "@/lib/cms/payload";
import { fieldClassFor } from "@/lib/cms/styles";
import type { FieldErrors } from "./types";
import { RichTextEditor } from "./RichTextEditor";

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

/** The API rejects a blank value on these, so say so before the save fails. */
function RequiredMark({ required }: { required?: boolean }) {
  const t = useTranslations("cms");
  if (!required) return null;
  return (
    <span className="ml-1 font-semibold text-red-700 dark:text-red-300" title={t("required")}>
      *<span className="sr-only"> {t("required")}</span>
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-300">
      {message}
    </p>
  );
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

function FieldShell({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: (describedBy?: string) => React.ReactNode;
}) {
  const errorId = useId();
  return (
    <label className="block text-sm font-medium text-igqs-ink dark:text-igqs-sand">
      {label}
      <RequiredMark required={required} />
      <Hint id={hint} />
      {children(error ? errorId : undefined)}
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function UploadControl({
  field,
  values,
  onChange,
  error,
}: {
  field: Extract<CmsField, { type: "image" | "file" }>;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  error?: string;
}) {
  const t = useTranslations("cms");
  const isImage = field.type === "image";
  const fileValue = values[field.fileName];
  const clearing = Boolean(values[`clear_${field.fileName}`]);
  const stored = clearing ? "" : String(values[field.name] ?? "");
  const [objectUrl, setObjectUrl] = useState("");
  const errorId = useId();

  useEffect(() => {
    if (!(fileValue instanceof File) || !isImage) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(fileValue);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileValue, isImage]);

  const preview =
    objectUrl || (!clearing && typeof fileValue === "string" && fileValue ? fileValue : stored);
  const pendingName = fileValue instanceof File ? fileValue.name : "";

  return (
    <div className="rounded-2xl border border-igqs-gold/20 bg-white p-4 dark:bg-[#10261e]">
      <p className="text-sm font-semibold">
        {t(field.label)}
        <RequiredMark required={field.required} />
      </p>
      <p className="mt-1 text-xs leading-relaxed text-igqs-muted">
        {t(field.hint ?? (isImage ? "uploadImageHint" : "documentFileHint"))}
      </p>
      {isImage ? (
        preview ? (
          <AdminPhoto
            src={preview}
            fileName={pendingName || undefined}
            onCropped={(file) =>
              onChange({
                ...values,
                [field.fileName]: file,
                [`clear_${field.fileName}`]: false,
              })
            }
          />
        ) : null
      ) : pendingName ? (
        <p className="mt-3 text-sm">{pendingName}</p>
      ) : preview ? (
        <a
          href={preview}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-igqs-green underline dark:text-igqs-gold-soft"
        >
          {t("viewCurrentFile")}
        </a>
      ) : (
        <p className="mt-3 text-sm text-igqs-muted">{t("noFileYet")}</p>
      )}
      <div className="mt-3">
        <ImageFileInput
          accept={isImage ? "image/*" : (field.type === "file" && field.accept) || undefined}
          invalid={Boolean(error)}
          describedBy={error ? errorId : undefined}
          filled={Boolean(preview)}
          onChange={(file) =>
            onChange({
              ...values,
              [field.fileName]: file ?? "",
              [`clear_${field.fileName}`]: false,
            })
          }
        />
      </div>
      <FieldError id={errorId} message={error} />
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

export function CmsControl({
  field,
  values,
  onChange,
  errors,
  englishLabel,
  bengaliLabel,
}: {
  field: CmsField;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  errors: FieldErrors;
  englishLabel: string;
  bengaliLabel: string;
}) {
  const t = useTranslations("cms");
  const label = t(field.label);

  if (field.type === "pair") {
    const Control = field.textarea ? "textarea" : "input";
    const errorEn = errors[`${field.name}_en`];
    const errorBn = errors[`${field.name}_bn`];
    return (
      <div className="rounded-2xl border border-igqs-gold/20 bg-white p-4 dark:bg-[#10261e]">
        <p className="text-sm font-semibold">
          {label}
          <RequiredMark required={field.required} />
        </p>
        <Hint id={field.hint} />
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {(["en", "bn"] as const).map((code) => {
            const key = `${field.name}_${code}`;
            const message = code === "en" ? errorEn : errorBn;
            return field.rich ? (
              <div key={key} className="text-sm">
                <LangMark code={code} label={code === "en" ? englishLabel : bengaliLabel} />
                <RichTextEditor
                  value={String(values[key] ?? "")}
                  invalid={Boolean(message)}
                  onChange={(next) => setValue(values, key, next, onChange)}
                />
                <FieldError id={`${key}-error`} message={message} />
              </div>
            ) : (
              <PairInput
                key={key}
                code={code}
                label={code === "en" ? englishLabel : bengaliLabel}
                Control={Control}
                textarea={field.textarea}
                value={String(values[key] ?? "")}
                message={message}
                onChange={(next) => setValue(values, key, next, onChange)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-start gap-3 rounded-2xl border border-igqs-gold/20 bg-white px-4 py-3 text-sm dark:bg-[#10261e]">
        <input
          type="checkbox"
          className="mt-0.5 size-6 accent-igqs-green"
          checked={Boolean(values[field.name])}
          onChange={(event) => setValue(values, field.name, event.currentTarget.checked, onChange)}
        />
        <span className="font-medium">{label}</span>
      </label>
    );
  }

  const error = errors[field.name];

  if (field.type === "select") {
    const raw = values[field.name];
    const current = raw === null || raw === undefined ? "" : String(raw);
    return (
      <FieldShell label={label} hint={field.hint} required={field.required} error={error}>
        {(describedBy) => (
          <select
            className={fieldClassFor(Boolean(error))}
            value={current}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
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
        )}
      </FieldShell>
    );
  }

  if (field.type === "image" || field.type === "file") {
    return <UploadControl field={field} values={values} onChange={onChange} error={error} />;
  }

  if (field.type === "datetime") {
    return (
      <FieldShell label={label} hint={field.hint} required={field.required} error={error}>
        {(describedBy) => (
          <input
            type="datetime-local"
            className={fieldClassFor(Boolean(error))}
            value={toDateTimeLocal(String(values[field.name] ?? ""))}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => setValue(values, field.name, event.currentTarget.value, onChange)}
          />
        )}
      </FieldShell>
    );
  }

  // Numbers and money amounts stay strings in form state. Coercing with
  // Number() on every keystroke turned an emptied box into a real 0 — on the
  // admission fee that silently replaced the school default with ৳0.
  const numeric = field.type === "number" || field.type === "decimal";
  return (
    <FieldShell label={label} hint={field.hint} required={field.required} error={error}>
      {(describedBy) => (
        <input
          type={field.type === "url" ? "url" : "text"}
          inputMode={field.type === "number" ? "numeric" : field.type === "decimal" ? "decimal" : undefined}
          className={fieldClassFor(Boolean(error))}
          value={String(values[field.name] ?? "")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            const next = event.currentTarget.value;
            if (numeric && next !== "" && !/^\d*\.?\d*$/.test(next)) return;
            setValue(values, field.name, next, onChange);
          }}
        />
      )}
    </FieldShell>
  );
}

function PairInput({
  code,
  label,
  Control,
  textarea,
  value,
  message,
  onChange,
}: {
  code: "en" | "bn";
  label: string;
  Control: "input" | "textarea";
  textarea?: boolean;
  value: string;
  message?: string;
  onChange: (next: string) => void;
}) {
  const errorId = useId();
  const invalid = Boolean(message);
  return (
    <label className="text-sm">
      <LangMark code={code} label={label} />
      <Control
        className={textarea ? `${fieldClassFor(invalid)} min-h-28` : fieldClassFor(invalid)}
        rows={textarea ? 4 : undefined}
        value={value}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <FieldError id={errorId} message={message} />
    </label>
  );
}
