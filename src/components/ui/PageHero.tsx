import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/motion/FadeIn";
import { Link } from "@/i18n/navigation";
import type { Crumb } from "@/lib/seo";

export function PageHero({
  title,
  subtitle,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  const brand = useTranslations("brand");
  const a11y = useTranslations("a11y");
  return (
    <section className="on-dark pattern-geo-dark border-y border-igqs-gold bg-igqs-forest py-12 text-igqs-cream print:hidden dark:bg-[#0b241c] sm:py-16">
      <FadeIn className="mx-auto max-w-7xl px-4 sm:px-6">
        {crumbs && crumbs.length > 1 && (
          <nav aria-label={a11y("breadcrumb")} className="mb-4">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-igqs-cream/75">
              {crumbs.map((crumb, index) => {
                const current = index === crumbs.length - 1;
                return (
                  <li key={`${crumb.path}-${index}`} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden="true">/</span>}
                    {current ? (
                      <span aria-current="page" className="text-igqs-cream">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link href={crumb.path} className="hover:text-igqs-gold">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <p className="eyebrow">{brand("name")}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-igqs-cream/80">{subtitle}</p>
        )}
      </FadeIn>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  tone = "light",
  className = "",
}: {
  kicker?: string;
  title: string;
  tone?: "light" | "onDark";
  className?: string;
}) {
  const onDark = tone === "onDark";
  return (
    <div className={`mb-8 ${className}`}>
      {kicker && <p className="eyebrow">{kicker}</p>}
      <h2
        className={`mt-2 font-display text-3xl leading-tight md:text-[3.0625rem] ${
          onDark ? "text-igqs-cream" : "text-igqs-forest dark:text-igqs-gold-soft"
        }`}
      >
        {title}
      </h2>
      <div className="heading-rule mt-3" />
    </div>
  );
}
