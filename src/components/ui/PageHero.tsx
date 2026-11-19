import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TextRise } from "@/components/motion/TextRise";
import type { Crumb } from "@/lib/seo";
import { ArchCorner, BookMark, Swoosh } from "./Ornaments";

export function PageHero({
  title,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  const a11y = useTranslations("a11y");
  return (
    <section className="band-green on-dark relative overflow-hidden py-4 text-igqs-cream print:hidden sm:py-5">
      <ArchCorner id="page-hero-arch-right" side="right" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {crumbs && crumbs.length > 1 && (
          <nav aria-label={a11y("breadcrumb")}>
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
        <h1 className="sr-only">{title}</h1>
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
  rise = true,
}: {
  kicker?: string;
  title: string;
  tone?: "light" | "onDark";
  align?: "left" | "center";
  className?: string;
  id?: string;
  /** Word-by-word entrance. Turn off when the heading sits inside another reveal. */
  rise?: boolean;
}) {
  const onDark = tone === "onDark";
  const titleColor = onDark ? "text-igqs-cream" : "text-igqs-green dark:text-igqs-gold-soft";
  const titleClass = `heading-strong text-[1.9rem] leading-tight md:text-[2.75rem] ${titleColor}`;
  const heading = rise ? (
    <TextRise as="h2" id={id} text={title} className={align === "left" ? `mt-2 ${titleClass}` : titleClass} />
  ) : align === "left" ? (
    <h2 id={id} className={`mt-2 ${titleClass}`}>
      {title}
    </h2>
  ) : (
    <h2 id={id} className={titleClass}>
      {title}
    </h2>
  );
  if (align === "center") {
    return (
      <div className={`mb-10 text-center ${className}`}>
        <div className="reveal mx-auto w-fit" data-reveal="pop" suppressHydrationWarning>
          <BookMark className="mx-auto h-8 w-14 text-igqs-gold sm:h-9 sm:w-16" />
        </div>
        {kicker && <p className="eyebrow mt-2">{kicker}</p>}
        <div className="mt-1 flex items-center justify-center gap-4 sm:gap-6">
          <span className="heading-side-line reveal" data-reveal="draw" suppressHydrationWarning aria-hidden />
          {heading}
          <span className="heading-side-line heading-side-line-end reveal" data-reveal="draw" suppressHydrationWarning aria-hidden />
        </div>
      </div>
    );
  }
  return (
    <div className={`mb-8 ${className}`}>
      {kicker && <p className="reveal eyebrow eyebrow-line" suppressHydrationWarning>{kicker}</p>}
      {heading}
      <Swoosh draw className="heading-swoosh mt-1.5 h-3 w-28 sm:h-3.5 sm:w-36" />
    </div>
  );
}
