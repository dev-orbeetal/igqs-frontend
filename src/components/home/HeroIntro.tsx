import { ChevronDown } from "lucide-react";
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
  scrollTarget,
  scrollLabel,
}: {
  kicker: string;
  title?: string;
  subtitle?: string;
  applyLabel: string;
  curriculumLabel: string;
  fallbackTitle: string;
  /** Element id the scroll cue jumps to; the cue is omitted without one. */
  scrollTarget?: string;
  scrollLabel?: string;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pt-10 pb-20 sm:px-6 sm:pt-16 sm:pb-24">
      <p className="reveal-now eyebrow" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
        {kicker}
      </p>
      <h1
        className="reveal-now mt-3 max-w-3xl font-display text-[1.85rem] leading-[1.2] text-white sm:mt-4 sm:text-5xl sm:leading-[1.15] lg:text-6xl"
        style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
      >
        {title || fallbackTitle}
      </h1>
      {subtitle ? (
        <div className="reveal-now" style={{ "--reveal-delay": "240ms" } as React.CSSProperties}>
          <div className="heading-rule rule-draw-now mt-4 sm:mt-5" style={{ "--reveal-delay": "420ms" } as React.CSSProperties} />
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-igqs-cream/90 sm:mt-5 sm:text-lg">{subtitle}</p>
        </div>
      ) : null}
      <div
        className="reveal-now mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3"
        data-reveal="pop"
        style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
      >
        <Link href="/admission" className="btn-gold btn-shine inline-flex">
          {applyLabel}
        </Link>
        <Link href="/curriculum" className="btn-gold-outline">
          {curriculumLabel}
        </Link>
      </div>
      {scrollTarget ? (
        <a
          href={`#${scrollTarget}`}
          aria-label={scrollLabel}
          className="scroll-cue reveal-now motion-micro absolute bottom-5 left-1/2 hidden size-11 -translate-x-1/2 items-center justify-center rounded-full border border-igqs-gold/50 text-igqs-gold-soft hover:bg-white/10 sm:inline-flex"
          style={{ "--reveal-delay": "600ms" } as React.CSSProperties}
        >
          <ChevronDown className="scroll-cue-icon size-5" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
