import { getTranslations } from "next-intl/server";
import { BrandLoader } from "@/components/ui/BrandLoader";

/**
 * Route-level loading state. Public pages fetch their content on the
 * server, so without this a slow API leaves the user on the previous page
 * with no feedback at all. A thin gold bar runs along the top while the
 * branded loader fills the content area.
 */
export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <>
      <div className="loader-bar fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden" aria-hidden>
        <span className="block h-full w-1/3 rounded-full bg-igqs-gold" />
      </div>
      <div className="hero-pattern flex min-h-[60svh] items-center justify-center px-4 py-20">
        <BrandLoader label={t("loading")} />
      </div>
    </>
  );
}
