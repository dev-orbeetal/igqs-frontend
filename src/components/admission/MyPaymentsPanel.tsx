"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiUrl, type ApplicationDetail } from "@/lib/api";
import { isBdPhone, normalizeBdPhone } from "@/lib/guardian";
import { fieldClass } from "./fields";

function statusLabel(status: string, t: ReturnType<typeof useTranslations<"admission">>) {
  if (status === "approved") return t("paid");
  if (status === "rejected") return t("paymentFailed");
  return t("paymentPending");
}

export function MyPaymentsPanel() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [lookedUp, setLookedUp] = useState("");
  const [rows, setRows] = useState<ApplicationDetail[]>([]);
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeBdPhone(phone);
    if (!isBdPhone(normalized)) {
      setError(t("otpInvalidPhone"));
      return;
    }
    setPhone(normalized);
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/api/admissions/me/applications/?phone=${encodeURIComponent(normalized)}`, locale)
      );
      const data = (await response.json().catch(() => ({}))) as {
        detail?: string;
        results?: ApplicationDetail[];
      };
      if (!response.ok) {
        setRows([]);
        setLookedUp("");
        setError(data.detail || t("receiptSearchError"));
        return;
      }
      setLookedUp(normalized);
      setRows(data.results ?? []);
    } catch {
      setRows([]);
      setLookedUp("");
      setError(t("receiptSearchError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={lookup} className="rounded-3xl border border-igqs-gold/25 bg-white p-5 dark:bg-[#0d1f18] sm:p-7">
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
        {error && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
        >
          {loading ? t("searchingReceipt") : t("searchReceipt")}
        </button>
      </form>

      {lookedUp && !loading && rows.length === 0 && (
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
