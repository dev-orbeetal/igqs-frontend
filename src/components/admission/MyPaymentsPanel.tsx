"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGetAuth, apiPost, parseApiError, type ApplicationDetail } from "@/lib/api";
import {
  getGuardianSession,
  isBdPhone,
  normalizeBdPhone,
  setGuardianSession,
} from "@/lib/guardian";
import { PhoneVerifyStep } from "./PhoneVerifyStep";

function statusLabel(status: string, t: ReturnType<typeof useTranslations<"admission">>) {
  if (status === "approved") return t("paid");
  if (status === "rejected") return t("paymentFailed");
  return t("paymentPending");
}

export function MyPaymentsPanel() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sessionPhone, setSessionPhone] = useState("");
  const [rows, setRows] = useState<ApplicationDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getGuardianSession();
    if (session) {
      setSessionPhone(session.phone);
      setPhone(session.phone);
      loadPayments(session.token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function loadPayments(token: string) {
    setLoading(true);
    try {
      const data = await apiGetAuth<{ results: ApplicationDetail[] }>(
        "/api/admissions/me/applications/",
        token,
        locale
      );
      setRows(data.results);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    setError("");
    const normalized = normalizeBdPhone(phone);
    if (!isBdPhone(normalized)) {
      setError(t("otpInvalidPhone"));
      return;
    }
    setPhone(normalized);
    setSending(true);
    try {
      const result = await apiPost("/api/admissions/otp/send/", { phone: normalized });
      setDebugOtp(result.debug_otp || "");
      setCountdown(result.resend_in || 60);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.form || t("otpIncorrect"));
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setVerifying(true);
    try {
      const result = await apiPost("/api/admissions/otp/verify/", {
        phone: normalizeBdPhone(phone),
        otp,
      });
      setGuardianSession({ token: result.token, phone: result.phone });
      setSessionPhone(result.phone);
      setOtp("");
      await loadPayments(result.token);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.code === "otp_expired") setError(t("otpExpired"));
      else if (parsed.code === "otp_incorrect") setError(t("otpIncorrect"));
      else setError(parsed.form || t("otpIncorrect"));
    } finally {
      setVerifying(false);
    }
  }

  if (!sessionPhone) {
    return (
      <div className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18] sm:p-7">
        <PhoneVerifyStep
          phone={phone}
          otp={otp}
          verified={false}
          sending={sending}
          verifying={verifying}
          countdown={countdown}
          debugOtp={debugOtp}
          error={error}
          onPhoneChange={setPhone}
          onOtpChange={setOtp}
          onSend={sendOtp}
          onVerify={verifyOtp}
          onReset={() => undefined}
        />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-igqs-muted">
        {t("verifiedPhone")}: <span className="font-mono">{sessionPhone}</span>
      </p>
      {loading ? (
        <p className="text-sm text-igqs-muted">{t("searchingReceipt")}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-3xl border border-igqs-gold/25 bg-white p-6 text-sm dark:bg-[#0d1f18]">
          {t("emptyPayments")}
        </p>
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => (
            <article
              key={row.application_id}
              className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18]"
            >
              <p className="text-sm text-igqs-muted">{t("admissionFee")}</p>
              <h2 className="mt-1 font-display text-2xl">{row.applying_class}</h2>
              <p className="mt-3 font-display text-3xl">
                ৳{Number(row.transaction.payment_amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
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
