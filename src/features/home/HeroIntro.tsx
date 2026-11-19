import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TextRise } from "@/components/motion/TextRise";

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
    <div className="hero-copy pointer-events-none relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pt-10 pb-20 sm:px-6 sm:pt-16 sm:pb-24">
      <p className="reveal-now eyebrow pointer-events-auto" style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
        {kicker}
      </p>
      <TextRise
        as="h1"
        immediate
        delay={280}
        text={title || fallbackTitle}
        className="pointer-events-auto mt-3 max-w-3xl font-display text-[1.85rem] leading-[1.2] text-white sm:mt-4 sm:text-5xl sm:leading-[1.15] lg:text-6xl"
      />
      {subtitle ? (
        <div className="reveal-now pointer-events-auto" style={{ "--reveal-delay": "480ms" } as React.CSSProperties}>
          <div className="heading-rule rule-draw-now mt-4 sm:mt-5" style={{ "--reveal-delay": "840ms" } as React.CSSProperties} />
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-igqs-cream/90 sm:mt-5 sm:text-lg">{subtitle}</p>
        </div>
      ) : null}
      <div
        className="reveal-now pointer-events-auto mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3"
        data-reveal="pop"
        style={{ "--reveal-delay": "640ms" } as React.CSSProperties}
      >
        <Link href="/admission/apply" className="btn-gold btn-shine btn-shine-once btn-sparkle inline-flex">
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
          className="scroll-cue reveal-now motion-micro pointer-events-auto absolute bottom-5 left-1/2 hidden size-11 -translate-x-1/2 items-center justify-center rounded-full border border-igqs-gold/50 text-igqs-gold-soft hover:bg-white/10 sm:inline-flex"
          style={{ "--reveal-delay": "1200ms" } as React.CSSProperties}
        >
          <ChevronDown className="scroll-cue-icon size-5" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
