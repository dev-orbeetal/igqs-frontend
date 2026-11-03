"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiPost, parseApiError, type ApplicationDetail } from "@/lib/api";
import { isBdPhone, normalizeBdPhone } from "@/lib/guardian";
import { fieldClass } from "./fields";
import { formatAmountNumber } from "@/lib/format";

function statusLabel(status: string, t: ReturnType<typeof useTranslations<"admission">>) {
  if (status === "approved") return t("paid");
  if (status === "rejected") return t("paymentFailed");
  return t("paymentPending");
}

/**
 * Guardian payment history. Unlocked by the mobile number on the
 * application plus the student's date of birth — no SMS step. The DOB is
 * sent in a POST body so it never appears in URLs or logs.
 */
export function MyPaymentsPanel() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ApplicationDetail[] | null>(null);

  async function findPayments(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeBdPhone(phone);
    if (!isBdPhone(normalized)) {
      setError(t("invalidPhone"));
      return;
    }
    if (!dateOfBirth) {
      setError(t("paymentsInvalidDob"));
      return;
    }
    setPhone(normalized);
    setError("");
    setLoading(true);
    try {
      const data = (await apiPost("/api/admissions/me/applications/", {
        phone: normalized,
        date_of_birth: dateOfBirth,
      })) as { results?: ApplicationDetail[] };
      setRows(data.results ?? []);
    } catch (err) {
      const { code, form } = parseApiError(err);
      if (code === "no_match") setError(t("paymentsNoMatch"));
      else if (code === "lookup_locked") setError(t("paymentsLocked"));
      else if (code === "invalid_dob") setError(t("paymentsInvalidDob"));
      else if (code === "invalid_phone") setError(t("invalidPhone"));
      else setError(form || t("receiptSearchError"));
    } finally {
      setLoading(false);
    }
  }

  function changeNumber() {
    setPhone("");
    setDateOfBirth("");
    setRows(null);
    setError("");
  }

  if (rows === null) {
    return (
      <div className="fade-status">
        <form onSubmit={findPayments} className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18] sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              {t("mobile")}
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className={fieldClass}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <label className="text-sm">
              {t("dob")}
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={fieldClass}
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-igqs-muted">{t("paymentsLookupHint")}</p>
          {error && (
            <p role="alert" className="message-in mt-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-solid mt-4 min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
          >
            {loading ? t("findingPayments") : t("findPayments")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-status">
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
