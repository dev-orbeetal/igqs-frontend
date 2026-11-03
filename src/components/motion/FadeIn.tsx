/**
 * Scroll reveal that is safe to server-render: the element is visible in the
 * HTML, and RevealObserver plays its CSS entrance once, when it first
 * scrolls into view. Previously this used framer-motion's whileInView,
 * which server-rendered every section at opacity:0 — the page stayed blank
 * until hydration, and never appeared at all without JavaScript.
 */
export function FadeIn({
  children,
  className,
  id,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * @deprecated Stagger is now automatic: RevealObserver offsets elements
   * that enter the viewport together, in document order. Kept so existing
   * call sites compile; it has no effect.
   */
  delay?: number;
  id?: string;
  /** Entrance style; defaults to a short slide-up. */
  variant?: "pop" | "left" | "right" | "fade";
}) {
  return (
    <div
      id={id}
      className={className ? `reveal ${className}` : "reveal"}
      data-reveal={variant}
      // RevealObserver may tag this before it hydrates (inside client trees).
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
