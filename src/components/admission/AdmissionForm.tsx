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
import {
  clearGuardianSession,
  getGuardianSession,
  isBdPhone,
  normalizeBdPhone,
  setGuardianSession,
} from "@/lib/guardian";
import { AdmissionStepper } from "./AdmissionStepper";
import { ClassSelectStep } from "./ClassSelectStep";
import { CLASS_LABEL_KEYS, loadDraft, saveDraft, type AdmissionClassSlug, type WizardForm } from "./fields";
import { PaymentStatusStep } from "./PaymentStatusStep";
import { PaymentSummaryStep } from "./PaymentSummaryStep";
import { PhoneVerifyStep } from "./PhoneVerifyStep";
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
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [application, setApplication] = useState<ApplicationDetail | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    setForm((prev) => ({ payment_date: todayIso(), payment_method: "bkash", ...draft, ...prev }));
    const session = getGuardianSession();
    if (session) {
      setVerifiedPhone(session.phone);
      setForm((prev) => ({ ...prev, mobile: prev.mobile || session.phone }));
    }
  }, []);

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  const applicableFee = useMemo<AdmissionFeeInfo | null>(() => {
    const match = info?.fees.find((fee) => fee.grade_slug && fee.grade_slug === form.applying_class_slug);
    return match ?? info?.default_fee ?? null;
  }, [form.applying_class_slug, info]);

  const classLabel = form.applying_class_slug
    ? t(CLASS_LABEL_KEYS[form.applying_class_slug as AdmissionClassSlug] ?? "selectClass")
    : form.applying_class;

  const infoValid = Boolean(
    form.student_name &&
      form.student_name_bn &&
      form.date_of_birth &&
      form.gender &&
      form.applying_class &&
      form.student_address &&
      form.father_name &&
      form.mother_name &&
      form.guardian_name &&
      form.father_occupation &&
      form.mobile &&
      form.email &&
      form.guardian_address &&
      form.emergency_contact &&
      files.photo &&
      files.birth
  );

  const phoneVerified = Boolean(verifiedPhone && normalizeBdPhone(form.mobile || "") === verifiedPhone);
  const receiptReady = application?.status === "approved";

  async function sendOtp() {
    setOtpError("");
    const phone = normalizeBdPhone(form.mobile || "");
    if (!isBdPhone(phone)) {
      setOtpError(t("otpInvalidPhone"));
      return;
    }
    setField("mobile", phone);
    setSendingOtp(true);
    try {
      const result = await apiPost("/api/admissions/otp/send/", { phone });
      setDebugOtp(result.debug_otp || "");
      setCountdown(result.resend_in || 60);
    } catch (error) {
      const parsed = parseApiError(error);
      setOtpError(parsed.form || parsed.code || t("otpIncorrect"));
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    setOtpError("");
    setVerifyingOtp(true);
    try {
      const phone = normalizeBdPhone(form.mobile || "");
      const result = await apiPost("/api/admissions/otp/verify/", { phone, otp });
      setGuardianSession({ token: result.token, phone: result.phone });
      setVerifiedPhone(result.phone);
      setField("mobile", result.phone);
      setOtp("");
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.code === "otp_expired") setOtpError(t("otpExpired"));
      else if (parsed.code === "otp_incorrect") setOtpError(t("otpIncorrect"));
      else setOtpError(parsed.form || t("otpIncorrect"));
    } finally {
      setVerifyingOtp(false);
    }
  }

  function resetPhone() {
    clearGuardianSession();
    setVerifiedPhone("");
    setOtp("");
    setDebugOtp("");
  }

  async function submitPayment() {
    const session = getGuardianSession();
    if (!session || !phoneVerified || sending) return;
    setSending(true);
    setFormError("");
    setFieldErrors({});
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (applicableFee) data.set("payment_amount", String(Number(applicableFee.amount)));
    data.set("mobile", session.phone);
    data.set("payer_mobile", session.phone);
    if (!form.payment_method) data.set("payment_method", "bkash");
    if (files.photo) data.append("student_photo", files.photo);
    if (files.birth) data.append("birth_certificate", files.birth);
    if (files.screenshot) data.append("payment_screenshot", files.screenshot);
    try {
      setProcessing(true);
      setStep(4);
      const result = (await apiPost("/api/admissions/apply/", data, session.token)) as ApplicationDetail;
      setApplication(result);
      window.setTimeout(() => setProcessing(false), 900);
    } catch (error) {
      setProcessing(false);
      setStep(3);
      const parsed = parseApiError(error);
      setFieldErrors(parsed.fields);
      setFormError(parsed.form || t("error"));
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (step !== 4 || !application || application.status !== "pending") return;
    const id = application.application_id;
    const timer = window.setInterval(() => {
      apiGet<ApplicationDetail>(`/api/admissions/applications/${encodeURIComponent(id)}/`, "bn").then((latest) => {
        if (latest) setApplication(latest);
      });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [step, application]);

  function goNext() {
    setFormError("");
    if (step === 0 && !form.applying_class_slug) {
      setFormError(t("continueWithoutClass"));
      return;
    }
    if (step === 1 && !infoValid) {
      const missing: Record<string, string> = {};
      if (!files.photo) missing.student_photo = t("fileMissing");
      if (!files.birth) missing.birth_certificate = t("fileMissing");
      setFieldErrors(missing);
      setFormError(!files.photo || !files.birth ? t("reattachFiles") : t("requiredField"));
      return;
    }
    if (step === 2 && !phoneVerified) {
      setOtpError(t("otpInvalidPhone"));
      return;
    }
    if (step === 1 && phoneVerified) {
      setStep(3);
      return;
    }
    setStep((value) => value + 1);
  }

  function goBack() {
    if (step === 3 && phoneVerified) {
      setStep(1);
      return;
    }
    setStep((value) => Math.max(0, value - 1));
  }

  function retry() {
    setApplication(null);
    setProcessing(false);
    setStep(3);
  }

  const canContinue =
    step === 0
      ? Boolean(form.applying_class_slug)
      : step === 1
        ? infoValid
        : step === 2
          ? phoneVerified
          : false;

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
            onSelect={(option) => {
              setField("applying_class_slug", option.slug);
              setField("applying_class", option.name);
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
            onPhoto={(file) => setFiles((prev) => ({ ...prev, photo: file }))}
            onBirth={(file) => setFiles((prev) => ({ ...prev, birth: file }))}
          />
        )}
        {step === 2 && (
          <PhoneVerifyStep
            phone={form.mobile ?? ""}
            otp={otp}
            verified={phoneVerified}
            sending={sendingOtp}
            verifying={verifyingOtp}
            countdown={countdown}
            debugOtp={debugOtp}
            error={otpError}
            onPhoneChange={(value) => setField("mobile", value)}
            onOtpChange={setOtp}
            onSend={sendOtp}
            onVerify={verifyOtp}
            onReset={resetPhone}
          />
        )}
        {step === 3 && (
          <PaymentSummaryStep
            form={form}
            fee={applicableFee}
            methods={info?.methods ?? []}
            errors={fieldErrors}
            onChange={setField}
            onScreenshot={(file) => setFiles((prev) => ({ ...prev, screenshot: file }))}
          />
        )}
        {step === 4 && (
          <PaymentStatusStep data={application} processing={processing} onRetry={retry} />
        )}
        {formError && <p className="mt-4 text-sm text-red-700 dark:text-red-300">{formError}</p>}
      </div>
      {step < 4 && (
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
          {step < 3 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={goNext}
              className="min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {tc("next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={sending || !form.transaction_id || !phoneVerified}
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
