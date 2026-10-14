"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo({
  compact = false,
  light = false,
  src,
}: {
  compact?: boolean;
  light?: boolean;
  src?: string | null;
}) {
  const t = useTranslations("brand");

  return (
    <Link href="/" className="group flex items-center gap-3">
      {src ? (
        <img
          src={src}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-igqs-gold/70 sm:h-12 sm:w-12"
        />
      ) : (
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-igqs-gold bg-igqs-green text-igqs-gold-soft shadow-[0_0_0_4px_rgba(196,163,90,0.15)] sm:h-11 sm:w-11">
          <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden>
            <path
              d="M20 6c6 0 11 4.2 11 10.2 0 4.4-2.8 8-7.2 9.4.8-1.6 1.2-3.3 1.2-5.1C25 14.2 22.8 11 20 11s-5 3.2-5 9.5c0 1.8.4 3.5 1.2 5.1C11.8 24.2 9 20.6 9 16.2 9 10.2 14 6 20 6z"
              fill="currentColor"
            />
            <path d="M14 30h12M16 33h8" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      )}
      {!compact && (
        <span>
          <span
            className={`block font-display text-lg leading-none tracking-wide ${
              light
                ? "text-igqs-cream"
                : "text-igqs-green group-hover:text-igqs-forest dark:text-igqs-gold-soft"
            }`}
          >
            {t("name")}
          </span>
          <span className="eyebrow mt-1 hidden text-[11px] sm:block">
            {t("tagline")}
          </span>
        </span>
      )}
    </Link>
  );
}
