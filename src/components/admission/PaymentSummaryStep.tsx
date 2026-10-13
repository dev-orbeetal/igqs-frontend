"use client";

import { useTranslations } from "next-intl";
import type { AdmissionFeeInfo, PaymentMethodInfo } from "@/lib/api";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { controlClass, fieldClass, fieldErrorClass, type WizardForm } from "./fields";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-igqs-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function PaymentSummaryStep({
  form,
  fee,
  methods,
  errors,
  onChange,
  onScreenshot,
}: {
  form: WizardForm;
  fee: AdmissionFeeInfo | null;
  methods: PaymentMethodInfo[];
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onScreenshot: (file?: File) => void;
}) {
  const t = useTranslations("admission");
  const amount = fee ? `৳${Number(fee.amount).toLocaleString("en-BD")}` : "—";
  const selected = methods.find((method) => method.code === form.payment_method) ?? methods[0];

  return (
    <div className="grid gap-6">
      <h2 className="font-display text-2xl sm:text-3xl">{t("paymentSummary")}</h2>
      <dl className="rounded-3xl border border-igqs-gold/25 bg-igqs-sand/40 px-4 py-3 dark:bg-white/5">
        <Row label={t("studentName")} value={form.student_name || "—"} />
        <Row label={t("applyingClass")} value={form.applying_class || "—"} />
        <Row label={t("guardianName")} value={form.guardian_name || "—"} />
        <Row label={t("verifiedPhone")} value={form.mobile || "—"} />
      </dl>

      <div className="rounded-3xl bg-igqs-green px-5 py-6 text-center text-igqs-cream dark:bg-[#0b241c]">
        <p className="text-sm text-igqs-gold-soft">{t("admissionFee")}</p>
        <p className="mt-2 font-display text-4xl">{amount}</p>
        <p className="mt-4 text-sm text-igqs-gold-soft">{t("totalDue")}</p>
        <p className="font-display text-5xl">{amount}</p>
      </div>

      <div>
        <h3 className="font-display text-xl">{t("payExternally")}</h3>
        <p className="mt-1 text-sm text-igqs-muted">{t("payExternalHint")}</p>
        <div className="mt-4 grid gap-3">
          {methods.map((method) => (
            <label
              key={method.code}
              className={`cursor-pointer rounded-2xl border px-4 py-4 ${
                (form.payment_method || selected?.code) === method.code
                  ? "border-igqs-gold bg-igqs-gold/15"
                  : "border-igqs-gold/30"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                className="mr-2"
                checked={(form.payment_method || selected?.code) === method.code}
                onChange={() => onChange("payment_method", method.code)}
              />
              <span className="font-medium">{method.name}</span>
              <div className="mt-2 grid gap-1">
                {method.details.map((detail, index) => (
                  <p key={`${detail.label}-${index}`} className="text-sm text-igqs-muted">
                    {detail.label ? <span className="text-igqs-gold">{detail.label}: </span> : null}
                    <span className="whitespace-pre-wrap">{detail.value}</span>
                  </p>
                ))}
              </div>
            </label>
          ))}
        </div>
        {errors.payment_method && <p className={fieldErrorClass}>{errors.payment_method}</p>}
      </div>

      <label className="text-sm">
        {t("transactionId")}
        <input
          data-field="transaction_id"
          aria-invalid={Boolean(errors.transaction_id)}
          className={controlClass(Boolean(errors.transaction_id))}
          value={form.transaction_id ?? ""}
          onChange={(event) => onChange("transaction_id", event.target.value)}
        />
        {errors.transaction_id && <p className={fieldErrorClass}>{errors.transaction_id}</p>}
      </label>
      <label className="text-sm">
        {t("paymentAmount")}
        <input className={`${fieldClass} bg-igqs-sand/40 dark:bg-white/5`} value={amount} readOnly />
      </label>
      <label className="text-sm">
        {t("paymentDate")}
        <input
          data-field="payment_date"
          aria-invalid={Boolean(errors.payment_date)}
          type="date"
          className={controlClass(Boolean(errors.payment_date))}
          value={form.payment_date ?? ""}
          onChange={(event) => onChange("payment_date", event.target.value)}
        />
        {errors.payment_date && <p className={fieldErrorClass}>{errors.payment_date}</p>}
      </label>
      <div className="text-sm">
        {t("screenshot")}
        <ImageFileInput
          dataField="payment_screenshot"
          invalid={Boolean(errors.payment_screenshot)}
          onChange={onScreenshot}
        />
        {errors.payment_screenshot && <p className={fieldErrorClass}>{errors.payment_screenshot}</p>}
      </div>
    </div>
  );
}
