import { Link } from "@/i18n/navigation";

/**
 * Hero copy. Rendered visible on the server with a CSS entrance animation —
 * the previous framer-motion version server-rendered the <h1> itself at
 * opacity:0, so the page's main heading was invisible until hydration.
 */
export function HeroIntro({
  kicker,
  title,
  subtitle,
  applyLabel,
  curriculumLabel,
  fallbackTitle,
}: {
  kicker: string;
  title?: string;
  subtitle?: string;
  applyLabel: string;
  curriculumLabel: string;
  fallbackTitle: string;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pt-16 pb-24 sm:px-6">
      <p className="reveal-now eyebrow">{kicker}</p>
      <h1
        className="reveal-now mt-4 max-w-3xl font-display text-4xl leading-[1.15] text-white sm:text-5xl lg:text-6xl"
        style={{ "--reveal-delay": "0.08s" } as React.CSSProperties}
      >
        {title || fallbackTitle}
      </h1>
      {subtitle ? (
        <div className="reveal-now" style={{ "--reveal-delay": "0.16s" } as React.CSSProperties}>
          <div className="heading-rule mt-5" />
          <p className="mt-5 max-w-xl text-base leading-relaxed text-igqs-cream/90 sm:text-lg">{subtitle}</p>
        </div>
      ) : null}
      <div
        className="reveal-now mt-8 flex flex-wrap gap-3"
        style={{ "--reveal-delay": "0.24s" } as React.CSSProperties}
      >
        <Link href="/admission" className="btn-gold inline-flex">
          {applyLabel}
        </Link>
        <Link href="/curriculum" className="btn-gold-outline">
          {curriculumLabel}
        </Link>
      </div>
    </div>
  );
}
