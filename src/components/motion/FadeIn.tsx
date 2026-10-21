/**
 * Scroll reveal that is safe to server-render: the element is visible in the
 * HTML and the animation is applied purely in CSS (scroll-driven where the
 * browser supports it). Previously this used framer-motion's whileInView,
 * which server-rendered every section at opacity:0 — the page stayed blank
 * until hydration, and never appeared at all without JavaScript.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in seconds. Converted to a capped scroll-range index. */
  delay?: number;
  id?: string;
}) {
  const index = Math.min(4, Math.max(0, Math.round(delay / 0.08)));
  return (
    <div
      id={id}
      className={className ? `reveal ${className}` : "reveal"}
      style={index ? ({ "--reveal-index": index } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
