"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ApplicationDetail } from "@/lib/api";
import { formatAmountNumber } from "@/lib/format";

export type { ApplicationDetail };

function methodLabel(
  code: string,
  t: ReturnType<typeof useTranslations<"admission">>
) {
  if (code === "bkash") return t("methodBkash");
  if (code === "nagad") return t("methodNagad");
  if (code === "rocket") return t("methodRocket");
  if (code === "bank") return t("methodBank");
  return code;
}

function statusLabel(
  status: string,
  t: ReturnType<typeof useTranslations<"admission">>
) {
  if (status === "approved") return t("approved");
  if (status === "rejected") return t("rejected");
  return t("pending");
}

function formatSubmitted(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-igqs-gold">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

const buttonClass =
  "inline-flex rounded-full bg-igqs-green px-5 py-2.5 text-sm text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink";
const ghostButtonClass =
  "inline-flex rounded-full border border-igqs-gold/40 px-5 py-2.5 text-sm";

export function ApplicationReceiptCard({
  data,
  fallbackApplicationId,
  heading,
  kicker,
  intro,
  showEmailNote = false,
  showPrint = false,
  showViewPdf = false,
}: {
  data: ApplicationDetail | null;
  fallbackApplicationId?: string;
  heading: string;
  kicker?: string;
  intro?: string;
  showEmailNote?: boolean;
  showPrint?: boolean;
  showViewPdf?: boolean;
}) {
  const t = useTranslations("admission");
  const locale = useLocale();
  const trx = data?.transaction;
  const viewUrl = data?.receipt_view_url || data?.receipt_pdf_url;

  function printReceipt() {
    window.print();
  }

  return (
    <div
      id="receipt-print"
      className="rounded-3xl border border-igqs-gold/30 bg-white p-8 dark:bg-[#0d1f18]"
    >
      {kicker && (
        <p className="text-center text-xs uppercase tracking-[0.28em] text-igqs-gold">
          {kicker}
        </p>
      )}
      <h2 className={`${kicker ? "mt-3" : ""} text-center font-display text-4xl`}>{heading}</h2>
      {intro && <p className="mt-4 text-center text-igqs-muted">{intro}</p>}

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-igqs-sand/50 px-4 py-3 dark:bg-white/5">
          <dt className="text-xs uppercase tracking-[0.18em] text-igqs-gold">{t("applicationId")}</dt>
          <dd className="mt-1 font-mono text-lg text-igqs-green dark:text-igqs-gold-soft">
            {data?.application_id ?? fallbackApplicationId ?? "—"}
          </dd>
        </div>
        <div className="rounded-2xl bg-igqs-sand/50 px-4 py-3 dark:bg-white/5">
          <dt className="text-xs uppercase tracking-[0.18em] text-igqs-gold">{t("receiptId")}</dt>
          <dd className="mt-1 font-mono text-lg text-igqs-green dark:text-igqs-gold-soft">
            {data?.receipt_id ?? "—"}
          </dd>
        </div>
      </dl>

      {data && (
        <div className="mt-8 border-t border-igqs-gold/20 pt-6">
          <h3 className="font-display text-2xl">{t("applicationDetails")}</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Detail label={t("studentName")} value={data.student_name} />
            <Detail label={t("studentNameBn")} value={data.student_name_bn} />
            <Detail label={t("guardianName")} value={data.guardian_name} />
            <Detail label={t("applyingClass")} value={data.applying_class} />
            <Detail label={t("mobile")} value={data.mobile} />
            <Detail label={t("email")} value={data.email} />
            <Detail
              label={t("submittedAt")}
              value={data.created_at ? formatSubmitted(data.created_at, locale) : ""}
            />
            <Detail label={t("status")} value={statusLabel(data.status, t)} />
            {data.status === "rejected" ? (
              <Detail label={t("rejectionReason")} value={data.rejection_reason} />
            ) : null}
          </dl>
        </div>
      )}

      {trx && (
        <div className="mt-8 border-t border-igqs-gold/20 pt-6">
          <h3 className="font-display text-2xl">{t("paymentInfo")}</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Detail label={t("paymentMethod")} value={methodLabel(trx.payment_method, t)} />
            <Detail label={t("transactionId")} value={trx.transaction_id} />
            <Detail
              label={t("admissionFee")}
              value={`BDT ${formatAmountNumber(trx.payment_amount, locale)}`}
            />
            <Detail label={t("paymentDate")} value={trx.payment_date} />
            <Detail label={t("payerMobile")} value={trx.payer_mobile} />
            {trx.payment_screenshot ? (
              <div>
                <dt className="text-igqs-gold">{t("screenshot")}</dt>
                <dd className="mt-0.5">
                  <a href={trx.payment_screenshot} className="underline" target="_blank" rel="noreferrer">
                    {t("screenshotAttached")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      )}

      {data?.receipt_pdf_url && (
        <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
          {showViewPdf && viewUrl && (
            <a href={viewUrl} target="_blank" rel="noreferrer" className={ghostButtonClass}>
              {t("viewReceipt")}
            </a>
          )}
          <a href={data.receipt_pdf_url} className={buttonClass}>
            {t("downloadReceipt")}
          </a>
          {showPrint && (
            <button type="button" onClick={printReceipt} className={ghostButtonClass}>
              {t("printReceipt")}
            </button>
          )}
        </div>
      )}

      {showEmailNote && data && (
        <p className="mt-3 text-center text-sm text-igqs-muted print:hidden">
          {data.receipt_email_sent ? t("emailSent") : t("emailPending")}
        </p>
      )}
    </div>
  );
}
