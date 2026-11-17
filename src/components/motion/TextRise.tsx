import type { CSSProperties, ElementType } from "react";

const MAX_WORD_STEPS = 10;
const WORD_STEP_MS = 84;

/**
 * Word-by-word rise for headings. The full string stays in the HTML, so the
 * title is readable without JavaScript and by assistive tech. Motion is
 * CSS-only: immediate headings animate on first paint; scroll headings wait
 * for RevealObserver and play once. Reduced motion skips the animation and
 * leaves the words in place.
 */
export function TextRise({
  text,
  className,
  as: Tag = "span",
  immediate = false,
  id,
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  /** Play as soon as the page paints (hero, page title). */
  immediate?: boolean;
  id?: string;
  /** Delay before the first word, in milliseconds. */
  delay?: number;
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const classes = immediate
    ? className
    : className
      ? `reveal reveal-words ${className}`
      : "reveal reveal-words";

  return (
    <Tag
      id={id}
      className={classes}
      data-reveal={immediate ? undefined : "words"}
      suppressHydrationWarning={immediate ? undefined : true}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={immediate ? "text-rise-now" : "text-rise"}
          style={{ "--w": `${delay + Math.min(index, MAX_WORD_STEPS) * WORD_STEP_MS}ms` } as CSSProperties}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
