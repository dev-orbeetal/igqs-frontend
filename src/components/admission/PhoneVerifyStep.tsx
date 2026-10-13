"use client";

import { useTranslations } from "next-intl";
import { controlClass, fieldErrorClass } from "./fields";

export function PhoneVerifyStep({
  phone,
  otp,
  verified,
  sending,
  verifying,
  countdown,
  debugOtp,
  error,
  onPhoneChange,
  onOtpChange,
  onSend,
  onVerify,
  onReset,
}: {
  phone: string;
  otp: string;
  verified: boolean;
  sending: boolean;
  verifying: boolean;
  countdown: number;
  debugOtp?: string;
  error: string;
  onPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSend: () => void;
  onVerify: () => void;
  onReset: () => void;
}) {
  const t = useTranslations("admission");

  if (verified) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50 px-5 py-8 text-center dark:bg-emerald-950/30">
        <p className="font-display text-2xl text-emerald-800 dark:text-emerald-200">{t("otpVerified")}</p>
        <p className="mt-3 font-mono text-lg">{phone}</p>
        <button type="button" className="mt-5 text-sm underline" onClick={onReset}>
          {t("changeNumber")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl">{t("verifyHeading")}</h2>
      <p className="mt-2 text-sm text-igqs-muted">{t("otpHint")}</p>
      <label className="mt-6 block text-sm">
        {t("mobile")}
        <input
          data-field="mobile"
          aria-invalid={Boolean(error && !phone.trim())}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={t("otpPlaceholder")}
          className={controlClass(Boolean(error && !phone.trim()))}
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={sending || countdown > 0}
        onClick={onSend}
        className="mt-4 min-h-12 w-full rounded-full bg-igqs-green px-5 text-base text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {sending ? t("sendingOtp") : countdown > 0 ? t("resendIn", { seconds: countdown }) : t("sendOtp")}
      </button>

      <label className="mt-8 block text-sm">
        {t("otpLabel")}
        <input
          data-field="otp"
          aria-invalid={Boolean(error && phone.trim())}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className={`${controlClass(Boolean(error && phone.trim()))} text-center font-mono text-2xl tracking-[0.4em]`}
          value={otp}
          onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </label>
      {debugOtp && (
        <p className="mt-2 text-sm text-igqs-muted">
          Dev OTP: <span className="font-mono">{debugOtp}</span>
        </p>
      )}
      {error && <p className={fieldErrorClass}>{error}</p>}
      <button
        type="button"
        disabled={verifying || otp.length !== 6}
        onClick={onVerify}
        className="mt-4 min-h-12 w-full rounded-full bg-igqs-green px-5 text-base text-igqs-cream disabled:opacity-40 dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {verifying ? t("verifyingOtp") : t("verifyOtp")}
      </button>
    </div>
  );
}
