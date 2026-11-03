"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ApplicationDetail } from "@/lib/api";
import { formatAmountNumber } from "@/lib/format";
import { receiptFontVariables } from "./receiptFonts";

export type { ApplicationDetail };

const SCHOOL_NAME_BN = "আদর্শ গ্লোবাল কুরআনিক স্কুল";

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
    dateStyle: "long",
    timeStyle: "short",
  });
}

/** Open book: the receipt's title mark and (faintly) its watermark. */
function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M32 31C24 25 14 24 4 27V6c10-3 20-2 28 5 8-7 18-8 28-5v21c-10-3-20-2-28 4z" />
      <path d="M32 11v20" />
      <path d="M10 13c6-1.5 11-1 16 1.5M10 18c6-1.5 11-1 16 1.5M38 14.5c5-2.5 10-3 16-1.5M38 19.5c5-2.5 10-3 16-1.5" />
      <path d="M2 30c10-3 20-2 30 4 10-6 20-7 30-4" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

function StatusIcon({ status }: { status: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-[1.15em] shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      {status === "approved" ? (
        <path d="m8 12.5 2.8 2.7L16.5 9.5" />
      ) : status === "rejected" ? (
        <path d="m9 9 6 6m0-6-6 6" />
      ) : (
        <path d="M12 7v5l3.5 2" />
      )}
    </svg>
  );
}

const STATUS_PILL: Record<string, string> = {
  pending: "border-[#f2cf63] bg-[#fde38f] text-[#16241d]",
  approved: "border-[#b5dcc3] bg-[#d7eedf] text-[#0f5132]",
  rejected: "border-[#efb9bf] bg-[#f8d9dc] text-[#842029]",
};

/** One table row: label cell (sand) and value cell. Stacks on phones. */
function Row({
  label,
  children,
  highlight = false,
}: {
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="receipt-row grid border-t border-[#e9e4d8] first:border-t-0 sm:grid-cols-[minmax(9rem,34%)_1fr]">
      <dt className="bg-[#f6f0e3] px-4 pt-3 pb-1 text-[0.85rem] font-medium text-[#3b4a43] sm:flex sm:items-center sm:px-6 sm:py-3.5 sm:text-[0.95rem] sm:text-[#16241d]">
        {label}
      </dt>
      <dd
        className={`min-w-0 px-4 pt-1 pb-3 text-[1rem] text-[#16241d] [overflow-wrap:anywhere] sm:flex sm:items-center sm:px-6 sm:py-3.5 sm:text-[1.05rem] ${
          highlight ? "receipt-fee bg-[#e6f0ea]" : "bg-white"
        }`}
      >
        {children}
      </dd>
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
  const brand = useTranslations("brand");
  const locale = useLocale();
  const trx = data?.transaction;
  const viewUrl = data?.receipt_view_url || data?.receipt_pdf_url;
  const applicationId = data?.application_id ?? fallbackApplicationId ?? "—";
  const receiptId = data?.receipt_id;
  const status = data?.status ?? "pending";

  async function printReceipt() {
    // Print only once the receipt faces are in, so Bangla never prints in
    // a fallback font.
    await document.fonts?.ready;
    window.print();
  }

  return (
    <div>
      <article
        id="receipt-print"
        className={`receipt-doc ${receiptFontVariables} overflow-hidden rounded-3xl border border-[#d9d2c2] bg-[#faf8f3] text-[#16241d] shadow-[0_18px_40px_rgb(16_35_28/0.08)]`}
      >
        {/* Header band: crest, divider, school names; arch on wider screens. */}
        <header className="receipt-header relative overflow-hidden bg-[linear-gradient(110deg,#0a3528_0%,#0f4535_55%,#145a43_100%)] px-5 py-6 sm:px-8 sm:py-7">
          <svg
            viewBox="0 0 120 160"
            preserveAspectRatio="xMaxYMax slice"
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[22%] min-w-32 md:block"
            aria-hidden
          >
            <defs>
              <pattern id="receipt-lattice" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M11 2l2.6 6.4L20 11l-6.4 2.6L11 20l-2.6-6.4L2 11l6.4-2.6z" fill="none" stroke="#c4a35a" strokeOpacity="0.25" strokeWidth="0.7" />
              </pattern>
            </defs>
            <path
              d="M12 160V112c0-14 10-19 20-22s13-12 15-20c3-12 13-19 24-21s16-15 18-34c3 14 12 19 31 21v124z"
              fill="#1b6a50"
              fillOpacity="0.55"
            />
            <path
              d="M12 160V112c0-14 10-19 20-22s13-12 15-20c3-12 13-19 24-21s16-15 18-34c3 14 12 19 31 21v124z"
              fill="url(#receipt-lattice)"
            />
            <path
              d="M12 160V112c0-14 10-19 20-22s13-12 15-20c3-12 13-19 24-21s16-15 18-34c3 14 12 19 31 21"
              fill="none"
              stroke="#c4a35a"
              strokeWidth="3"
            />
          </svg>
          <div className="relative flex items-center gap-4 sm:gap-6 md:pr-[17%]">
            {/* eslint-disable-next-line @next/next/no-img-element -- printed; must not lazy-load */}
            <img
              src="/brand/igqs-logo-256.png"
              alt=""
              className="size-16 shrink-0 rounded-full sm:size-24"
            />
            <span className="hidden h-20 w-px shrink-0 bg-[#e8d7a8]/70 sm:block" aria-hidden />
            <div className="min-w-0">
              <p className="receipt-eyebrow text-[0.62rem] font-semibold text-[#c4a35a] sm:text-[0.72rem]">
                Ideal Global Qur&apos;anic School
              </p>
              <p className="mt-1 text-[1.25rem] leading-tight font-bold text-white sm:text-[1.55rem]">{brand("name")}</p>
              <p lang="bn" className="receipt-bn mt-1 text-[1.05rem] leading-snug font-bold text-white sm:text-[1.45rem]">
                {SCHOOL_NAME_BN}
              </p>
            </div>
          </div>
        </header>
        <div className="receipt-goldrule h-1.5 bg-[linear-gradient(90deg,#b08a3e,#e6cd8a_25%,#c4a35a_50%,#e6cd8a_75%,#b08a3e)]" />

        <div className="relative px-4 pt-7 pb-6 sm:px-8 sm:pt-9 sm:pb-8">
          {/* Title */}
          <div className="text-center">
            <BookIcon className="mx-auto h-8 w-14 text-[#c4a35a] sm:h-9 sm:w-16" />
            {kicker && (
              <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-[#7a6329] uppercase">{kicker}</p>
            )}
            <div className="mt-1 flex items-center justify-center gap-4 sm:gap-6">
              <span className="hidden h-px w-16 bg-[#c4a35a] sm:block" aria-hidden />
              <h2 className="receipt-title text-2xl leading-tight font-bold text-[#0f3d30] sm:text-[2rem]">{heading}</h2>
              <span className="hidden h-px w-16 bg-[#c4a35a] sm:block" aria-hidden />
            </div>
            {intro && <p className="mt-3 text-sm text-[#5c6b66] sm:text-base">{intro}</p>}
          </div>

          {/* ID card */}
          <div className="mx-auto mt-6 max-w-xl">
            <dl className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-[#0f3d30] bg-[#f3f8f5] px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
              <dt className="flex shrink-0 items-center gap-3 text-[1.05rem] font-semibold whitespace-nowrap sm:text-[1.15rem]">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e2efe7] text-[#0f3d30]">
                  <DocIcon />
                </span>
                {t("applicationId")}
              </dt>
              <span className="hidden h-9 w-px bg-[#d9d2c2] sm:block" aria-hidden />
              <dd
                className={`min-w-0 leading-none font-bold text-[#0f3d30] [overflow-wrap:anywhere] ${
                  applicationId.length > 8 ? "text-[1.5rem] sm:text-[1.65rem]" : "text-[2rem] sm:text-[2.4rem]"
                }`}
              >
                {applicationId}
              </dd>
            </dl>
            {receiptId && receiptId !== applicationId && (
              <p className="mt-2 text-center text-xs text-[#5c6b66]">
                {t("receiptId")} <span className="font-semibold">{receiptId}</span>
              </p>
            )}
          </div>

          {data && (
            <section className="mt-8 sm:mt-10" aria-labelledby="receipt-details-heading">
              {/* Section tab with gold slash and a rule to the edge. */}
              <div className="flex items-end">
                <h3
                  id="receipt-details-heading"
                  className="receipt-tab relative z-[1] bg-[linear-gradient(90deg,#0a3528,#145a43)] py-2 pr-9 pl-4 text-base font-bold text-white [clip-path:polygon(0_0,100%_0,calc(100%-14px)_100%,0_100%)] sm:pl-6 sm:text-lg"
                >
                  {t("applicationDetails")}
                </h3>
                <span className="-ml-3 h-full w-2.5 self-stretch bg-[#c4a35a] [clip-path:polygon(60%_0,100%_0,40%_100%,0_100%)]" aria-hidden />
                <span className="mb-1 h-[2px] flex-1 bg-[#1a5c45]" aria-hidden />
              </div>

              <dl className="relative mt-3 overflow-hidden rounded-xl border border-[#d9d2c2]">
                <Row label={t("studentName")}>{data.student_name}</Row>
                {data.student_name_bn ? (
                  <Row label={t("studentNameBn")}>
                    <span lang="bn" className="receipt-bn">{data.student_name_bn}</span>
                  </Row>
                ) : null}
                <Row label={t("guardianName")}>{data.guardian_name}</Row>
                <Row label={t("applyingClass")}>{data.applying_class}</Row>
                <Row label={t("mobile")}>{data.mobile}</Row>
                {data.email ? <Row label={t("email")}>{data.email}</Row> : null}
                {trx ? (
                  <>
                    <Row label={t("admissionFee")} highlight>
                      <span className="text-lg font-bold text-[#0f3d30] sm:text-xl">
                        BDT {formatAmountNumber(trx.payment_amount, locale)}
                      </span>
                    </Row>
                    <Row label={t("paymentMethod")}>{methodLabel(trx.payment_method, t)}</Row>
                    <Row label={t("transactionId")}>
                      <span className="receipt-code inline-block max-w-full rounded-md bg-[#eceeec] px-3 py-1 font-[family-name:var(--font-receipt-mono)] font-medium tracking-wide [overflow-wrap:anywhere]">
                        {trx.transaction_id}
                      </span>
                    </Row>
                    {trx.payment_date ? <Row label={t("paymentDate")}>{trx.payment_date}</Row> : null}
                    {trx.payer_mobile ? <Row label={t("payerMobile")}>{trx.payer_mobile}</Row> : null}
                    {trx.payment_screenshot ? (
                      <Row label={t("screenshot")}>
                        <a href={trx.payment_screenshot} className="underline" target="_blank" rel="noreferrer">
                          {t("screenshotAttached")}
                        </a>
                      </Row>
                    ) : null}
                  </>
                ) : null}
                {data.created_at ? (
                  <Row label={t("submittedAt")}>{formatSubmitted(data.created_at, locale)}</Row>
                ) : null}
                <Row label={t("status")}>
                  <span
                    className={`receipt-status inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-bold ${
                      STATUS_PILL[status] ?? STATUS_PILL.pending
                    }`}
                  >
                    <StatusIcon status={status} />
                    {statusLabel(status, t)}
                  </span>
                </Row>
                {data.status === "rejected" && data.rejection_reason ? (
                  <Row label={t("rejectionReason")}>{data.rejection_reason}</Row>
                ) : null}
              </dl>
              <BookIcon className="receipt-watermark pointer-events-none absolute right-6 bottom-16 hidden h-24 w-40 text-[#c4a35a] opacity-[0.12] md:block" />
            </section>
          )}

          {/* Acknowledgement line */}
          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-[#c4a35a]" aria-hidden />
            <p className="receipt-ack max-w-md text-center text-[0.9rem] text-[#16241d] italic">
              {t("receiptAcknowledgement")}
            </p>
            <span className="h-px flex-1 bg-[#c4a35a]" aria-hidden />
          </div>
        </div>
        <div className="receipt-footband h-3 border-t-[3px] border-[#c4a35a] bg-[#0f3d30]" aria-hidden />
      </article>

      {data?.receipt_pdf_url && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
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
