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
  /** Kept for call-site compatibility; used as a small stagger offset. */
  delay?: number;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={className ? `reveal ${className}` : "reveal"}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
