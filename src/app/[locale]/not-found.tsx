import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.28em] text-igqs-forest dark:text-igqs-gold">404</p>
      <h1 className="mt-3 font-display text-4xl">{t("title")}</h1>
      <p className="mt-3 text-igqs-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-igqs-green px-5 py-2 text-sm text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
      >
        {t("home")}
      </Link>
    </div>
  );
}
