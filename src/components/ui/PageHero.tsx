import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Crumb } from "@/lib/seo";
import { ArchCorner, BookMark, Swoosh } from "./Ornaments";

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
    <section className="band-green on-dark relative overflow-hidden py-12 text-igqs-cream print:hidden sm:py-16">
      {/* Right arch only: the title is left-aligned and would sit on a left one. */}
      <ArchCorner id="page-hero-arch-right" side="right" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:pr-[20%] lg:pr-[18%]">
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
                      <Link href={crumb.path} className="motion-micro hover:text-igqs-gold">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <p className="reveal-now eyebrow eyebrow-line">{brand("name")}</p>
        <h1
          className="reveal-now heading-strong mt-3 text-[2.1rem] leading-tight text-white md:text-5xl"
          style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="reveal-now mt-3 max-w-2xl text-igqs-cream/80"
            style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Section title in the site's two styles. "left": eyebrow with a gold lead
 * line, bold title and a brush-stroke underline (sections with a "view all"
 * link beside the title). "center": open-book mark above and gold lines on
 * both sides of the title (standalone sections).
 */
export function SectionHeading({
  kicker,
  title,
  tone = "light",
  align = "left",
  className = "",
  id,
}: {
  kicker?: string;
  title: string;
  tone?: "light" | "onDark";
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  const onDark = tone === "onDark";
  const titleColor = onDark ? "text-igqs-cream" : "text-igqs-green dark:text-igqs-gold-soft";
  if (align === "center") {
    return (
      <div className={`mb-10 text-center ${className}`}>
        <BookMark className="mx-auto h-8 w-14 text-igqs-gold sm:h-9 sm:w-16" />
        {kicker && <p className="eyebrow mt-2">{kicker}</p>}
        <div className="mt-1 flex items-center justify-center gap-4 sm:gap-6">
          <span className="heading-side-line reveal" data-reveal="draw" suppressHydrationWarning aria-hidden />
          <h2 id={id} className={`heading-strong text-[1.9rem] leading-tight md:text-[2.75rem] ${titleColor}`}>
            {title}
          </h2>
          <span className="heading-side-line heading-side-line-end reveal" data-reveal="draw" suppressHydrationWarning aria-hidden />
        </div>
      </div>
    );
  }
  return (
    <div className={`mb-8 ${className}`}>
      {kicker && <p className="eyebrow eyebrow-line">{kicker}</p>}
      <h2 id={id} className={`heading-strong mt-2 text-[1.9rem] leading-tight md:text-[2.75rem] ${titleColor}`}>
        {title}
      </h2>
      <Swoosh draw className="heading-swoosh mt-1.5 h-3 w-28 sm:h-3.5 sm:w-36" />
    </div>
  );
}
