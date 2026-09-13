"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ApplicationDetail } from "@/lib/api";
import { ApplicationReceiptCard } from "./ApplicationReceiptCard";

export function PaymentStatusStep({
  data,
  processing,
  onRetry,
}: {
  data: ApplicationDetail | null;
  processing?: boolean;
  onRetry?: () => void;
}) {
  const t = useTranslations("admission");

  if (processing || !data) {
    return (
      <div className="rounded-3xl border border-igqs-gold/25 bg-white px-5 py-10 text-center dark:bg-[#0d1f18]">
        <p className="font-display text-2xl">{t("processingPayment")}</p>
        <p className="mt-3 text-sm text-igqs-muted">{t("processingStay")}</p>
      </div>
    );
  }

  if (data.status === "approved") {
    return (
      <div>
        <p className="mb-4 text-center font-display text-2xl text-emerald-800 dark:text-emerald-200">
          {t("paymentSuccess")}
        </p>
        <ApplicationReceiptCard
          data={data}
          heading={t("confirmationHeading")}
          showEmailNote
          showPrint
          showViewPdf
        />
        <div className="mt-5 flex flex-wrap justify-center gap-3 print:hidden">
          {data.receipt_pdf_url && (
            <a
              href={data.receipt_pdf_url}
              className="min-h-12 rounded-full bg-igqs-green px-5 py-3 text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {t("downloadReceiptBn")}
            </a>
          )}
          <Link href="/admission/payments" className="min-h-12 rounded-full border border-igqs-gold/40 px-5 py-3">
            {t("myPaymentsTitle")}
          </Link>
        </div>
      </div>
    );
  }

  if (data.status === "rejected") {
    return (
      <div className="rounded-3xl border border-red-400/40 bg-red-50 px-5 py-10 text-center dark:bg-red-950/20">
        <p className="font-display text-2xl">{t("paymentFailed")}</p>
        {data.rejection_reason && <p className="mt-3 text-sm">{data.rejection_reason}</p>}
        <p className="mt-2 font-mono text-sm text-igqs-muted">{data.application_id}</p>
        <div className="mt-6 flex flex-col gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-12 rounded-full bg-igqs-green px-5 text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {t("tryAgain")}
            </button>
          )}
          <Link href="/admission/payments" className="text-sm underline">
            {t("myPaymentsTitle")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-400/40 bg-amber-50 px-5 py-10 text-center dark:bg-amber-950/20">
      <p className="font-display text-2xl">{t("paymentPending")}</p>
      <p className="mt-3 text-sm text-igqs-muted">{t("paymentPendingBody")}</p>
      <p className="mt-4 font-mono text-sm">{data.application_id}</p>
      <p className="mt-1 text-sm text-igqs-muted">
        {t("transactionId")}: {data.transaction.transaction_id}
      </p>
      <Link
        href="/admission/payments"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-igqs-green px-5 text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {t("myPaymentsTitle")}
      </Link>
    </div>
  );
}
