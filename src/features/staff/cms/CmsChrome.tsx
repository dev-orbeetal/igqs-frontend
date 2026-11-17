"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Loading() {
  const t = useTranslations("cms");
  return (
    <div className="grid gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-20 animate-pulse rounded-2xl bg-igqs-sand/60 dark:bg-white/5" />
      ))}
    </div>
  );
}

/** Every editor used to call `staffRequest(...).then(setState)` with no catch,
 *  so a failed or 404 GET left the page on "Loading…" for good. */
export function LoadFailed({ onRetry, backHref }: { onRetry: () => void; backHref?: string }) {
  const tc = useTranslations("cms");
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
      <p>{tc("loadError")}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="font-semibold underline" onClick={onRetry}>
          {tc("retry")}
        </button>
        {backHref && (
          <Link href={backHref} className="font-semibold underline">
            ← {tc("backToList")}
          </Link>
        )}
      </div>
    </div>
  );
}

export function FormError({ message, extra }: { message: string; extra?: [string, string][] }) {
  if (!message && !extra?.length) return null;
  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
    >
      {message && <p>{message}</p>}
      {extra?.map(([key, value]) => (
        <p key={key} className={message ? "mt-1" : ""}>
          <span className="font-semibold">{key}:</span> {value}
        </p>
      ))}
    </div>
  );
}

export function Card({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-16 rounded-3xl border border-igqs-gold/25 bg-white p-5 shadow-sm dark:bg-[#0d1f18] sm:p-6"
    >
      <h2 className="border-b border-igqs-gold/20 pb-3 font-display text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Item editors sit on their own URL, where the shell header only shows the
 *  section name. This says which record is open and how to get back. */
export function Breadcrumb({ sectionLabel, listHref, current }: { sectionLabel: string; listHref: string; current: string }) {
  const t = useTranslations("cms");
  return (
    <nav aria-label={t("breadcrumb")} className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <Link href={listHref} className="font-medium text-igqs-green underline dark:text-igqs-gold-soft">
        ← {sectionLabel}
      </Link>
      <span aria-hidden className="text-igqs-muted">
        /
      </span>
      <span className="min-w-0 truncate text-igqs-muted">{current}</span>
    </nav>
  );
}
