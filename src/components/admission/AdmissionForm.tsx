"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  apiGet,
  apiPost,
  parseApiError,
  type AdmissionFeeInfo,
  type AdmissionInfo,
  type ApplicationDetail,
  type ClassOption,
} from "@/lib/api";
import { isBdPhone, normalizeBdPhone } from "@/lib/guardian";
import { AdmissionStepper } from "./AdmissionStepper";
import { ClassSelectStep } from "./ClassSelectStep";
import { loadDraft, saveDraft, type WizardForm } from "./fields";
import { PaymentStatusStep } from "./PaymentStatusStep";
import { PaymentSummaryStep } from "./PaymentSummaryStep";
import { StudentInfoStep } from "./StudentInfoStep";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AdmissionForm({
  classes,
  info,
}: {
  classes: ClassOption[];
  info: AdmissionInfo | null;
}) {
  const t = useTranslations("admission");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>({});
  const [files, setFiles] = useState<{ photo?: File; birth?: File; screenshot?: File }>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [application, setApplication] = useState<ApplicationDetail | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    setForm((prev) => ({ payment_date: todayIso(), payment_method: "bkash", ...draft, ...prev }));
  }, []);

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  const applicableFee = useMemo<AdmissionFeeInfo | null>(() => {
    const match = info?.fees.find((fee) => fee.grade_slug && fee.grade_slug === form.applying_class_slug);
    return match ?? info?.default_fee ?? null;
  }, [form.applying_class_slug, info]);

  const classLabel = form.applying_class || "";
  const receiptReady = application?.status === "approved";

  async function submitPayment() {
    if (sending) return;
    const missing: Record<string, string> = {};
    if (!String(form.transaction_id ?? "").trim()) missing.transaction_id = t("requiredField");
    if (!String(form.payment_date ?? "").trim()) missing.payment_date = t("requiredField");
    if (!files.screenshot) missing.payment_screenshot = t("screenshotRequired");
    if (Object.keys(missing).length) {
      showFieldErrors(missing);
      return;
    }
    setSending(true);
    setFormError("");
    setFieldErrors({});
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (applicableFee) data.set("payment_amount", String(Number(applicableFee.amount)));
    const phone = normalizeBdPhone(form.mobile || "");
    data.set("mobile", phone);
    data.set("payer_mobile", phone);
    if (!form.payment_method) data.set("payment_method", "bkash");
    if (files.photo) data.append("student_photo", files.photo);
    if (files.birth) data.append("birth_certificate", files.birth);
    if (files.screenshot) data.append("payment_screenshot", files.screenshot);
    try {
      setProcessing(true);
      setStep(3);
      const result = (await apiPost("/api/admissions/apply/", data)) as ApplicationDetail;
      setApplication(result);
      window.setTimeout(() => setProcessing(false), 900);
    } catch (error) {
      setProcessing(false);
      setStep(2);
      const parsed = parseApiError(error);
      setFieldErrors(parsed.fields);
      setFormError(parsed.form || t("error"));
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (step !== 3 || !application || application.status !== "pending") return;
    const id = application.application_id;
    const timer = window.setInterval(() => {
      apiGet<ApplicationDetail>(`/api/admissions/applications/${encodeURIComponent(id)}/`, "bn").then((latest) => {
        if (latest) setApplication(latest);
      });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [step, application]);

  function showFieldErrors(missing: Record<string, string>) {
    const names = Object.keys(missing);
    setFieldErrors(missing);
    setFormError(names.length ? t("requiredField") : "");
    if (!names.length) return;
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-field="${names[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function missingInfoFields() {
    const required = [
      "student_name",
      "student_name_bn",
      "date_of_birth",
      "gender",
      "student_address",
      "father_name",
      "mother_name",
      "guardian_name",
      "father_occupation",
      "mobile",
      "email",
      "guardian_address",
      "emergency_contact",
    ];
    const missing: Record<string, string> = {};
    for (const name of required) {
      if (!String(form[name] ?? "").trim()) missing[name] = t("requiredField");
    }
    if (!missing.mobile && !isBdPhone(normalizeBdPhone(form.mobile || ""))) {
      missing.mobile = t("otpInvalidPhone");
    }
    if (!files.photo) missing.student_photo = t("fileMissing");
    if (!files.birth) missing.birth_certificate = t("fileMissing");
    return missing;
  }

  function goNext() {
    setFormError("");
    if (step === 0 && !form.applying_class_slug) {
      showFieldErrors({ applying_class: t("continueWithoutClass") });
      setFormError(t("continueWithoutClass"));
      return;
    }
    if (step === 1) {
      const missing = missingInfoFields();
      if (Object.keys(missing).length) {
        showFieldErrors(missing);
        return;
      }
    }
    setFieldErrors({});
    setStep((value) => value + 1);
  }

  function goBack() {
    setStep((value) => Math.max(0, value - 1));
  }

  function retry() {
    setApplication(null);
    setProcessing(false);
    setStep(2);
  }

  return (
    <div className="rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18]">
      <div className="px-4 pt-5 sm:px-7 sm:pt-7">
        <AdmissionStepper step={step} receiptReady={Boolean(receiptReady)} />
      </div>
      <div className="px-4 py-6 pb-28 sm:px-7">
        {step === 0 && (
          <ClassSelectStep
            classes={classes}
            selectedSlug={form.applying_class_slug ?? ""}
            fee={applicableFee}
            error={fieldErrors.applying_class}
            onSelect={(option) => {
              setField("applying_class_slug", option.slug);
              setField("applying_class", option.name);
              setFieldErrors((prev) => ({ ...prev, applying_class: "" }));
              setFormError("");
            }}
          />
        )}
        {step === 1 && (
          <StudentInfoStep
            form={form}
            errors={fieldErrors}
            classLabel={classLabel || form.applying_class || ""}
            filesReady={{ photo: Boolean(files.photo), birth: Boolean(files.birth) }}
            onChange={setField}
            onPhoto={(file) => {
              setFiles((prev) => ({ ...prev, photo: file }));
              setFieldErrors((prev) => ({ ...prev, student_photo: "" }));
            }}
            onBirth={(file) => {
              setFiles((prev) => ({ ...prev, birth: file }));
              setFieldErrors((prev) => ({ ...prev, birth_certificate: "" }));
            }}
          />
        )}
        {step === 2 && (
          <PaymentSummaryStep
            form={form}
            fee={applicableFee}
            methods={info?.methods ?? []}
            errors={fieldErrors}
            onChange={setField}
            onScreenshot={(file) => setFiles((prev) => ({ ...prev, screenshot: file }))}
          />
        )}
        {step === 3 && (
          <PaymentStatusStep data={application} processing={processing} onRetry={retry} />
        )}
        {formError && <p className="mt-4 text-sm text-red-700 dark:text-red-300">{formError}</p>}
      </div>
      {step < 3 && (
        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-igqs-gold/20 bg-white/95 px-4 py-4 backdrop-blur dark:bg-[#0d1f18]/95 sm:flex-row sm:justify-between sm:px-7">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="min-h-12 rounded-full border border-igqs-gold/40 px-5 text-sm"
            >
              {tc("back")}
            </button>
          ) : (
            <Link href="/" className="min-h-12 rounded-full border border-igqs-gold/40 px-5 py-3 text-center text-sm">
              {t("cancelFlow")}
            </Link>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              className="min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {tc("next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={submitPayment}
              className="min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {sending ? t("processingPayment") : t("payWithBkash")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
