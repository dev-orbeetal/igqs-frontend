"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { btn } from "@/components/staff/buttons";
import { fieldClass, fieldClassInvalid } from "@/lib/cms";
import {
  StaffApiError,
  staffRequest,
  type StaffApplicationDetail,
  type StaffReceiptFields,
} from "@/lib/staff";

type Option = { value: string; label: string };

function fieldsFrom(data: StaffApplicationDetail): StaffReceiptFields {
  return {
    student_name: data.student_name,
    student_name_bn: data.student_name_bn,
    guardian_name: data.guardian_name,
    applying_class: data.applying_class,
    mobile: data.mobile,
    email: data.email,
    payment_method: data.transaction.payment_method || data.payment_method,
    transaction_id: data.transaction.transaction_id || data.transaction_id,
    payment_amount: data.transaction.payment_amount || data.payment_amount,
    payment_date: data.transaction.payment_date,
    payer_mobile: data.transaction.payer_mobile,
  };
}

/** Keeps the saved value selectable even if it is no longer offered. */
function withCurrent(options: Option[], current: string): Option[] {
  if (!current || options.some((option) => option.value === current)) return options;
  return [{ value: current, label: current }, ...options];
}

/**
 * Dialog for correcting the details printed on an admission receipt. Saving
 * rebuilds the PDF on the server, so every copy (download, public receipt
 * page, later emails) shows the corrected details.
 */
export function StaffReceiptEditor({
  open,
  data,
  onClose,
  onSaved,
}: {
  open: boolean;
  data: StaffApplicationDetail;
  onClose: () => void;
  onSaved: (updated: StaffApplicationDetail) => void;
}) {
  const t = useTranslations("staff");
  const ta = useTranslations("admission");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [form, setForm] = useState<StaffReceiptFields>(() => fieldsFrom(data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<Option[]>([]);
  const [methods, setMethods] = useState<Option[]>([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setForm(fieldsFrom(data));
      setErrors({});
      setFormError("");
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, data]);

  useEffect(() => {
    if (!open || (classes.length && methods.length)) return;
    staffRequest<{ slug: string; name: string }[]>("/api/admissions/classes/?lang=en")
      .then((rows) => setClasses(rows.map((row) => ({ value: row.name, label: row.name }))))
      .catch(() => setClasses([]));
    staffRequest<{ methods: { code: string; name: string }[] }>("/api/admissions/info/?lang=en")
      .then((info) => setMethods(info.methods.map((m) => ({ value: m.code, label: m.name }))))
      .catch(() => setMethods([]));
  }, [open, classes.length, methods.length]);

  function set<K extends keyof StaffReceiptFields>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setErrors({});
    try {
      const updated = await staffRequest<StaffApplicationDetail>(
        `/api/admissions/staff/applications/${encodeURIComponent(data.application_id)}/receipt/`,
        { method: "PATCH", body: JSON.stringify(form) }
      );
      onSaved(updated);
    } catch (err) {
      if (err instanceof StaffApiError) {
        setErrors(err.fieldErrors);
        setFormError(err.message || t("receiptEditError"));
      } else {
        setFormError(t("receiptEditError"));
      }
    } finally {
      setSaving(false);
    }
  }

  function field(
    key: keyof StaffReceiptFields,
    label: string,
    input: { type?: string; inputMode?: "numeric" | "decimal" | "email" | "tel"; options?: Option[] } = {}
  ) {
    const error = errors[key];
    const id = `receipt-${key}`;
    const common = {
      id,
      className: error ? fieldClassInvalid : fieldClass,
      value: form[key],
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
    } as const;
    return (
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {input.options ? (
          <select {...common} onChange={(event) => set(key, event.target.value)}>
            {withCurrent(input.options, form[key]).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...common}
            type={input.type ?? "text"}
            inputMode={input.inputMode}
            onChange={(event) => set(key, event.target.value)}
          />
        )}
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto max-h-[90svh] w-[min(100%-2rem,44rem)] overflow-y-auto rounded-2xl border border-igqs-border-strong bg-white p-6 text-igqs-ink backdrop:bg-black/40 dark:border-igqs-gold/70 dark:bg-[#0d1f18] dark:text-igqs-sand"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form onSubmit={save} noValidate>
        <h2 id={titleId} className="font-display text-2xl">
          {t("editReceiptTitle", { id: data.receipt_id })}
        </h2>
        <p className="mt-1 text-sm text-igqs-muted">{t("editReceiptHint")}</p>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-xs uppercase tracking-[0.14em] text-igqs-label">{ta("studentInfo")}</legend>
          {field("student_name", ta("studentName"))}
          {field("student_name_bn", ta("studentNameBn"))}
          {field("guardian_name", ta("guardianName"))}
          {field("applying_class", ta("applyingClass"), classes.length ? { options: classes } : {})}
          {field("mobile", ta("mobile"), { type: "tel", inputMode: "tel" })}
          {field("email", ta("email"), { type: "email", inputMode: "email" })}
        </fieldset>

        <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-xs uppercase tracking-[0.14em] text-igqs-label">{t("verifyPayment")}</legend>
          {field("payment_method", ta("paymentMethod"), methods.length ? { options: methods } : {})}
          {field("transaction_id", ta("transactionId"))}
          {field("payment_amount", ta("admissionFee"), { type: "number", inputMode: "decimal" })}
          {field("payment_date", ta("paymentDate"), { type: "date" })}
          {field("payer_mobile", ta("payerMobile"), { type: "tel", inputMode: "tel" })}
        </fieldset>

        {formError && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-700 dark:text-red-300">
            {formError}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className={btn.secondary} disabled={saving} onClick={onClose}>
            {t("cancel")}
          </button>
          <button type="submit" className={btn.primary} disabled={saving}>
            {saving ? t("savingReceipt") : t("saveReceipt")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
