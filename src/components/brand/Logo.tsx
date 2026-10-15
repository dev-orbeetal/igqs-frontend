"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo({
  compact = false,
  iconOnly = false,
  light = false,
  href = "/",
}: {
  compact?: boolean;
  iconOnly?: boolean;
  light?: boolean;
  href?: string;
}) {
  const t = useTranslations("brand");
  const name = t("name");

  return (
    <Link href={href} className="group inline-flex min-w-0 items-center gap-2.5" aria-label={name}>
      <img
        src="/brand/igqs-logo.png"
        alt=""
        className={compact || iconOnly ? "h-12 w-12 shrink-0 object-contain" : "h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"}
      />
      {!iconOnly && (
        <span
          className={`min-w-0 whitespace-nowrap font-display font-semibold leading-tight tracking-wide ${
            compact ? "text-sm" : "text-base sm:text-lg"
          } ${light ? "text-igqs-cream" : "text-igqs-green group-hover:text-igqs-forest dark:text-igqs-gold-soft"}`}
        >
          {name}
        </span>
      )}
    </Link>
  );
}
