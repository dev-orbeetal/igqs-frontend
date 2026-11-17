"use client";

import { Link } from "@/i18n/navigation";
import type { AdmissionInfo, ClassOption } from "@/lib/api/types";
import { AdmissionStepper } from "./AdmissionStepper";
import { ClassSelectStep } from "./ClassSelectStep";
import { PaymentStatusStep } from "./PaymentStatusStep";
import { PaymentSummaryStep } from "./PaymentSummaryStep";
import { StudentInfoStep } from "./StudentInfoStep";
import { useAdmissionWizard } from "./useAdmissionWizard";

export function AdmissionForm({
  classes,
  info,
}: {
  classes: ClassOption[];
  info: AdmissionInfo | null;
}) {
  const {
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
  } = useAdmissionWizard(info);

  return (
    <div className="rounded-3xl border border-igqs-gold/25 bg-white dark:bg-[#0d1f18]">
      <div className="px-4 pt-5 sm:px-7 sm:pt-7">
        <AdmissionStepper step={step} receiptReady={Boolean(receiptReady)} />
      </div>
      <div className="px-4 py-6 pb-28 sm:px-7">
        <div key={step} className="fade-swap">
        {step === 0 && (
          <ClassSelectStep
            classes={classes}
            selectedSlug={form.applying_class_slug ?? ""}
            fee={applicableFee}
            error={fieldErrors.applying_class}
            onSelect={(option) => {
              setField("applying_class_slug", option.slug);
              setField("applying_class", option.name);
              setFieldErrors((prev) => ({ ...prev, applying_class: "" }));
              setFormError("");
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
            onPhoto={(file) => {
              setFiles((prev) => ({ ...prev, photo: file }));
              setFieldErrors((prev) => ({ ...prev, student_photo: "" }));
            }}
            onBirth={(file) => {
              setFiles((prev) => ({ ...prev, birth: file }));
              setFieldErrors((prev) => ({ ...prev, birth_certificate: "" }));
            }}
          />
        )}
        {step === 2 && (
          <PaymentSummaryStep
            form={form}
            fee={applicableFee}
            methods={info?.methods ?? []}
            errors={fieldErrors}
            onChange={setField}
            onScreenshot={(file) => setFiles((prev) => ({ ...prev, screenshot: file }))}
          />
        )}
        {step === 3 && (
          <PaymentStatusStep data={application} processing={processing} onRetry={retry} />
        )}
        </div>
        {/* role="alert" so the error is announced; it was previously silent
            for screen reader users, who only heard "invalid" on the field. */}
        <p
          role="alert"
          aria-live="assertive"
          className={
            formError
              ? "message-in mt-4 text-sm text-red-700 dark:text-red-300"
              : "sr-only"
          }
        >
          {formError}
        </p>
      </div>
      {step < 3 && (
        <div data-sticky-actions className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-igqs-gold/20 bg-white/95 px-4 py-4 backdrop-blur dark:bg-[#0d1f18]/95 sm:flex-row sm:justify-between sm:px-7">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="btn-solid min-h-12 rounded-full border border-igqs-gold/40 px-5 text-sm hover:bg-igqs-gold/10"
            >
              {tc("back")}
            </button>
          ) : (
            <Link href="/" className="btn-solid min-h-12 rounded-full border border-igqs-gold/40 px-5 py-3 text-center text-sm hover:bg-igqs-gold/10">
              {t("cancelFlow")}
            </Link>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-solid min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {tc("next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={submitPayment}
              className="btn-solid btn-shine btn-sparkle min-h-12 rounded-full bg-igqs-green px-5 text-sm text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
            >
              {sending ? t("processingPayment") : t("payWithBkash")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
