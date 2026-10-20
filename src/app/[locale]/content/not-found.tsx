import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * An unknown CMS section (`/content/nope`) fell through to the public site's
 * 404, which is the wrong language and chrome for someone inside the panel.
 */
export default async function ContentNotFound() {
  const t = await getTranslations("cms");

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-3xl">{t("sectionNotFoundTitle")}</h1>
      <p className="mt-3 text-sm text-igqs-muted">{t("sectionNotFoundBody")}</p>
      <Link
        href="/content/home"
        className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-igqs-green px-5 text-sm font-semibold text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {t("backToList")}
      </Link>
    </div>
  );
}
