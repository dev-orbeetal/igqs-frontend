"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet, apiPost, parseApiError } from "@/lib/api/client";
import type { AdmissionFeeInfo, AdmissionInfo, ApplicationDetail } from "@/lib/api/types";
import { isBdPhone, normalizeBdPhone } from "@/lib/phone";
import { clearDraft, loadDraft, saveDraft, type WizardForm } from "./draft";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function useAdmissionWizard(info: AdmissionInfo | null) {
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
    if (!applicableFee) {
      setFormError(t("feeUnavailable"));
      setStep(0);
      return;
    }
    const methods = info?.methods ?? [];
    const missing: Record<string, string> = {};
    if (!String(form.transaction_id ?? "").trim()) missing.transaction_id = t("requiredField");
    if (!String(form.payment_date ?? "").trim()) missing.payment_date = t("requiredField");
    if (!files.screenshot) missing.payment_screenshot = t("screenshotRequired");
    if (methods.length > 0 && !methods.some((method) => method.code === form.payment_method)) {
      missing.payment_method = t("requiredField");
    }
    if (Object.keys(missing).length) {
      showFieldErrors(missing);
      return;
    }
    setSending(true);
    setFormError("");
    setFieldErrors({});
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.set("payment_amount", String(Number(applicableFee.amount)));
    const phone = normalizeBdPhone(form.mobile || "");
    data.set("mobile", phone);
    data.set("payer_mobile", phone);
    const effectiveMethod = methods.some((method) => method.code === form.payment_method)
      ? form.payment_method
      : methods[0]?.code;
    data.set("payment_method", effectiveMethod || "bkash");
    if (files.photo) data.append("student_photo", files.photo);
    if (files.birth) data.append("birth_certificate", files.birth);
    if (files.screenshot) data.append("payment_screenshot", files.screenshot);
    try {
      setProcessing(true);
      setStep(3);
      const result = (await apiPost("/api/admissions/apply/", data)) as ApplicationDetail;
      setApplication(result);
      clearDraft();
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
      missing.mobile = t("invalidPhone");
    }
    if (!missing.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email ?? "").trim())) {
      missing.email = t("invalidEmail");
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
    if (step === 0 && !applicableFee) {
      setFormError(t("feeUnavailable"));
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

  return {
    t,
    tc,
    step,
    form,
    files,
    setFiles,
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,
    sending,
    processing,
    application,
    setField,
    applicableFee,
    classLabel,
    receiptReady,
    submitPayment,
    goNext,
    goBack,
    retry,
  };
}
