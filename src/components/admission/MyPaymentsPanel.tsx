"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGetAuth, apiPost, parseApiError, type ApplicationDetail } from "@/lib/api";
import {
  clearGuardianSession,
  getGuardianSession,
  isBdPhone,
  normalizeBdPhone,
  setGuardianSession,
} from "@/lib/guardian";
import { fieldClass } from "./fields";
import { formatAmountNumber } from "@/lib/format";

function statusLabel(status: string, t: ReturnType<typeof useTranslations<"admission">>) {
  if (status === "approved") return t("paid");
  if (status === "rejected") return t("paymentFailed");
  return t("paymentPending");
}

type Step = "phone" | "otp" | "results";

export function MyPaymentsPanel() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [rows, setRows] = useState<ApplicationDetail[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  async function loadApplications(verifiedPhone: string, token: string) {
    try {
      const data = await apiGetAuth<{ results?: ApplicationDetail[] }>(
        `/api/admissions/me/applications/?phone=${encodeURIComponent(verifiedPhone)}`,
        token,
        locale
      );
      setRows(data.results ?? []);
      setStep("results");
    } catch {
      clearGuardianSession();
      setRows([]);
      setStep("phone");
      setError(t("receiptSearchError"));
    }
  }

  async function requestOtp(normalized: string) {
    setLoading(true);
    try {
      const data = (await apiPost("/api/admissions/otp/send/", { phone: normalized })) as {
        resend_in?: number;
      };
      setResendIn(data.resend_in ?? 60);
      setOtp("");
      setStep("otp");
    } catch (err) {
      const { form } = parseApiError(err);
      setError(form || t("receiptSearchError"));
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeBdPhone(phone);
    if (!isBdPhone(normalized)) {
      setError(t("otpInvalidPhone"));
      return;
    }
    setPhone(normalized);
    setError("");

    const cached = getGuardianSession();
    if (cached && cached.phone === normalized) {
      setLoading(true);
      await loadApplications(normalized, cached.token);
      setLoading(false);
      return;
    }

    await requestOtp(normalized);
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = (await apiPost("/api/admissions/otp/verify/", { phone, otp })) as {
        token: string;
      };
      setGuardianSession({ token: data.token, phone });
      await loadApplications(phone, data.token);
    } catch (err) {
      const { code, form } = parseApiError(err);
      if (code === "otp_incorrect") setError(t("otpIncorrect"));
      else if (code === "otp_expired" || code === "otp_locked") setError(t("otpExpired"));
      else setError(form || t("receiptSearchError"));
    } finally {
      setLoading(false);
    }
  }

  function changeNumber() {
    clearGuardianSession();
    setPhone("");
    setOtp("");
    setRows([]);
    setError("");
    setStep("phone");
  }

  if (step === "phone") {
    return (
      <div>
        <form onSubmit={sendOtp} className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18] sm:p-7">
          <label className="text-sm">
            {t("mobile")}
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              className={fieldClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <p className="mt-2 text-sm text-igqs-muted">{t("otpHint")}</p>
          {error && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
          >
            {loading ? t("sendingOtp") : t("sendOtp")}
          </button>
        </form>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div>
        <form onSubmit={verifyOtp} className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18] sm:p-7">
          <h2 className="font-display text-xl">{t("verifyHeading")}</h2>
          <p className="mt-1 text-sm text-igqs-muted">{phone}</p>
          <label className="mt-4 block text-sm">
            {t("otpLabel")}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={fieldClass}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
          </label>
          {error && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {loading ? t("verifyingOtp") : t("verifyOtp")}
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || loading}
              onClick={() => requestOtp(phone)}
              className="min-h-11 rounded-full border border-igqs-gold/40 px-4 text-sm disabled:opacity-40"
            >
              {resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resendOtp")}
            </button>
            <button
              type="button"
              onClick={changeNumber}
              className="min-h-11 rounded-full px-4 text-sm text-igqs-muted underline"
            >
              {t("changeNumber")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-igqs-muted">{phone}</p>
        <button type="button" onClick={changeNumber} className="text-sm text-igqs-green underline dark:text-igqs-gold">
          {t("changeNumber")}
        </button>
      </div>

      {rows.length === 0 && (
        <p className="mt-4 rounded-3xl border border-igqs-gold/25 bg-white p-6 text-sm dark:bg-[#0d1f18]">
          {t("emptyPayments")}
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 grid gap-4">
          {rows.map((row) => (
            <article
              key={row.application_id}
              className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18]"
            >
              <p className="text-sm text-igqs-muted">{t("admissionFee")}</p>
              <h2 className="mt-1 font-display text-2xl">{row.applying_class}</h2>
              <p className="mt-3 font-display text-3xl">
                ৳{formatAmountNumber(row.transaction.payment_amount, locale)}
              </p>
              <p className="mt-2 text-sm">{statusLabel(row.status, t)}</p>
              <p className="mt-1 text-sm text-igqs-muted">
                {new Date(row.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
                  dateStyle: "long",
                })}
              </p>
              <p className="mt-3 font-mono text-xs text-igqs-muted">
                {t("transactionId")}: {row.transaction.transaction_id}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/admission/success?id=${encodeURIComponent(row.application_id)}`}
                  className="min-h-11 rounded-full border border-igqs-gold/40 px-4 py-2 text-sm"
                >
                  {t("viewReceiptShort")}
                </Link>
                {row.status === "approved" && row.receipt_pdf_url && (
                  <a
                    href={row.receipt_pdf_url}
                    className="min-h-11 rounded-full bg-igqs-green px-4 py-2 text-sm text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                  >
                    {t("downloadPdf")}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
