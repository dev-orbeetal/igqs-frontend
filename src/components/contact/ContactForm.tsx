"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { apiPost } from "@/lib/api";

export function ContactForm() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      await apiPost("/api/contact/", data);
      form.reset();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-igqs-gold/25 bg-white p-6 dark:bg-[#0d1f18]">
      <h2 className="font-display text-3xl">{t("formTitle")}</h2>
      <label className="block text-sm">
        {t("name")}
        <input name="name" required className="mt-1 w-full min-h-12 rounded-xl border border-igqs-border-strong bg-white px-3 py-2 dark:border-igqs-gold/70 dark:bg-[#10261e]" />
      </label>
      <label className="block text-sm">
        {t("email")}
        <input name="email" type="email" required className="mt-1 w-full min-h-12 rounded-xl border border-igqs-border-strong bg-white px-3 py-2 dark:border-igqs-gold/70 dark:bg-[#10261e]" />
      </label>
      <label className="block text-sm">
        {t("phoneField")}
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="mt-1 w-full min-h-12 rounded-xl border border-igqs-border-strong bg-white px-3 py-2 dark:border-igqs-gold/70 dark:bg-[#10261e]"
        />
      </label>
      <label className="block text-sm">
        {t("subject")}
        <input name="subject" required className="mt-1 w-full min-h-12 rounded-xl border border-igqs-border-strong bg-white px-3 py-2 dark:border-igqs-gold/70 dark:bg-[#10261e]" />
      </label>
      <label className="block text-sm">
        {t("message")}
        <textarea name="message" required rows={5} className="mt-1 w-full min-h-12 rounded-xl border border-igqs-border-strong bg-white px-3 py-2 dark:border-igqs-gold/70 dark:bg-[#10261e]" />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-igqs-green px-6 py-3 text-sm text-igqs-cream disabled:opacity-60 dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {status === "sending" ? tc("sending") : tc("send")}
      </button>
      {/* Announced to assistive tech; previously the result was a silent
          line of text below a long form. */}
      <p aria-live="polite" className="sr-only">
        {status === "ok" ? t("success") : status === "error" ? t("error") : ""}
      </p>
      {status === "ok" && (
        <p className="rounded-xl border border-igqs-forest/30 bg-igqs-forest/10 px-4 py-3 text-sm text-igqs-forest dark:border-igqs-gold/40 dark:bg-igqs-gold/10 dark:text-igqs-gold-soft">
          {t("success")}
        </p>
      )}
      {status === "error" && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {t("error")}
        </p>
      )}
    </form>
  );
}
