"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Branded error boundary. Without it, a render failure on any public page
 * fell through to Next's default error screen.
 */
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");
  const tn = useTranslations("notFound");

  return (
    <div className="reveal-section mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl leading-tight">{t("errorTitle")}</h1>
      <p className="mt-3 text-igqs-muted">{t("errorBody")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-solid inline-flex min-h-12 items-center rounded-full bg-igqs-green px-6 text-sm text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="btn-solid inline-flex min-h-12 items-center rounded-full border border-igqs-border-strong px-6 text-sm hover:bg-igqs-gold/10"
        >
          {tn("home")}
        </Link>
      </div>
    </div>
  );
}
