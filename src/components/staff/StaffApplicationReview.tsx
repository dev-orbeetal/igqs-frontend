"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  staffDownload,
  staffRequest,
  type StaffApplicationDetail,
} from "@/lib/staff";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-igqs-gold">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

export function StaffApplicationReview({ applicationId }: { applicationId: string }) {
  const t = useTranslations("staff");
  const ta = useTranslations("admission");
  const locale = useLocale();
  const [data, setData] = useState<StaffApplicationDetail | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    staffRequest<StaffApplicationDetail>(
      `/api/admissions/staff/applications/${encodeURIComponent(applicationId)}/`
    ).then((detail) => {
      setData(detail);
      setReason(detail.rejection_reason || "");
    });
  }, [applicationId]);

  async function changeStatus(status: "approved" | "rejected" | "pending") {
    setSaving(true);
    setError("");
    try {
      const updated = await staffRequest<StaffApplicationDetail>(
        `/api/admissions/staff/applications/${encodeURIComponent(applicationId)}/status/`,
        {
          method: "POST",
          body: JSON.stringify({
            status,
            rejection_reason: status === "rejected" ? reason : "",
          }),
        }
      );
      setData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("statusError"));
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <p className="text-sm text-igqs-muted">{t("loading")}</p>;

  const fee = Number(data.payment_amount || data.transaction.payment_amount);
  const amount = Number.isFinite(fee)
    ? `BDT ${fee.toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}`
    : "";

  return (
    <div>
      <Link href="/staff/payments/applications" className="text-sm text-igqs-gold">
        ← {t("applicationsPage")}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-igqs-gold">{data.application_id}</p>
          <h1 className="mt-1 font-display text-4xl">{data.student_name}</h1>
          <p className="mt-1 text-sm text-igqs-muted">
            {data.status === "approved" ? ta("approved") : data.status === "rejected" ? ta("rejected") : ta("pending")} · {data.receipt_id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-igqs-gold/40 px-4 py-2 text-sm"
            onClick={() =>
              staffDownload(
                `/api/admissions/staff/applications/${data.application_id}/export/`,
                `${data.application_id}.csv`
              )
            }
          >
            {t("downloadApplication")}
          </button>
          <button
            type="button"
            className="rounded-full border border-igqs-gold/40 px-4 py-2 text-sm"
            onClick={() =>
              staffDownload(
                `/api/admissions/staff/applications/${data.application_id}/receipt/`,
                `${data.receipt_id}.pdf`
              )
            }
          >
            {t("downloadReceipt")}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
            <h2 className="font-display text-2xl">{ta("studentInfo")}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Row label={ta("studentName")} value={data.student_name} />
              <Row label={ta("studentNameBn")} value={data.student_name_bn} />
              <Row label={ta("dob")} value={data.date_of_birth} />
              <Row label={ta("gender")} value={data.gender === "female" ? ta("female") : ta("male")} />
              <Row label={ta("previousClass")} value={data.previous_class} />
              <Row label={ta("applyingClass")} value={data.applying_class} />
              <Row label={ta("address")} value={data.student_address} />
            </dl>
            {data.student_photo && (
              <img src={data.student_photo} alt={data.student_name} className="mt-4 h-40 rounded-2xl object-cover" />
            )}
            {data.birth_certificate && (
              <a href={data.birth_certificate} className="mt-3 inline-block text-sm text-igqs-gold underline" target="_blank" rel="noreferrer">
                {t("viewBirthCertificate")}
              </a>
            )}
          </section>

          <section className="rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
            <h2 className="font-display text-2xl">{ta("guardianInfo")}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Row label={ta("guardianName")} value={data.guardian_name} />
              <Row label={ta("fatherName")} value={data.father_name} />
              <Row label={ta("motherName")} value={data.mother_name} />
              <Row label={ta("fatherOccupation")} value={data.father_occupation} />
              <Row label={ta("motherOccupation")} value={data.mother_occupation} />
              <Row label={ta("mobile")} value={data.mobile} />
              <Row label={ta("email")} value={data.email} />
              <Row label={ta("emergency")} value={data.emergency_contact} />
              <Row label={ta("guardianAddress")} value={data.guardian_address} />
            </dl>
          </section>

          <section className="rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
            <h2 className="font-display text-2xl">{ta("moreInfo")}</h2>
            <dl className="mt-4 grid gap-4">
              <Row label={ta("previousAcademic")} value={data.previous_academic_info} />
              <Row label={ta("special")} value={data.special_requirements} />
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
            <h2 className="font-display text-2xl">{t("verifyPayment")}</h2>
            <dl className="mt-4 grid gap-4">
              <Row
                label={ta("paymentMethod")}
                value={data.payment_method_label || data.transaction.payment_method}
              />
              <Row
                label={ta("transactionId")}
                value={data.transaction_id || data.transaction.transaction_id}
              />
              <Row label={ta("admissionFee")} value={amount} />
              <Row label={ta("paymentDate")} value={data.transaction.payment_date} />
              <Row label={ta("payerMobile")} value={data.transaction.payer_mobile} />
            </dl>
            {data.transaction.payment_screenshot && (
              <a href={data.transaction.payment_screenshot} target="_blank" rel="noreferrer">
                <img
                  src={data.transaction.payment_screenshot}
                  alt={ta("screenshot")}
                  className="mt-4 rounded-2xl border border-igqs-gold/20"
                />
              </a>
            )}
          </section>

          <section className="rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
            <h2 className="font-display text-2xl">{t("decision")}</h2>
            <p className="mt-2 text-sm text-igqs-muted">{t("decisionHint")}</p>
            <label className="mt-4 block text-sm">
              {t("rejectionReason")}
              <textarea
                className="mt-1 w-full rounded-xl border border-igqs-gold/30 bg-transparent px-3 py-2"
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => changeStatus("approved")}
                className="rounded-full bg-igqs-green py-2 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
              >
                {t("approve")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => changeStatus("rejected")}
                className="rounded-full border border-red-400 py-2 text-sm text-red-700 disabled:opacity-40"
              >
                {t("reject")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => changeStatus("pending")}
                className="rounded-full border border-igqs-gold/40 py-2 text-sm disabled:opacity-40"
              >
                {t("markPending")}
              </button>
            </div>
            {data.reviewed_by && (
              <p className="mt-4 text-xs text-igqs-muted">
                {t("reviewedBy", { name: data.reviewed_by })}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
