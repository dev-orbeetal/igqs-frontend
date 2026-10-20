"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

/**
 * The logo is served through next/image from a 256px source. It previously
 * used a raw <img> pointing at a 1MB PNG, which every visitor downloaded on
 * every page (twice — header and footer) to display it at 48px.
 */
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
  const small = compact || iconOnly;

  return (
    <Link href={href} className="group inline-flex min-w-0 items-center gap-2.5" aria-label={name}>
      <Image
        src="/brand/igqs-logo-256.png"
        alt=""
        width={small ? 48 : 64}
        height={small ? 48 : 64}
        priority
        className={small ? "size-12 shrink-0 object-contain" : "size-14 shrink-0 object-contain sm:size-16"}
      />
      {!iconOnly && (
        <span
          className={`min-w-0 font-display font-semibold leading-tight tracking-wide ${
            compact ? "hidden text-sm sm:inline" : "text-base sm:text-lg"
          } ${light ? "text-igqs-cream" : "text-igqs-green group-hover:text-igqs-forest dark:text-igqs-gold-soft"}`}
        >
          {name}
        </span>
      )}
    </Link>
  );
}
