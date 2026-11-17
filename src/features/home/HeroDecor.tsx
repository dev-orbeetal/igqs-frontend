/**
 * Decorative gold shapes that drift slowly over the hero photo. Purely
 * ornamental (aria-hidden), placed toward the right so they never sit
 * behind the headline; paused with the slideshow and static under
 * reduced motion.
 */
const STAR = "M12 2l2.6 6.4L21 9.3l-4.9 4.4 1.4 6.8L12 17l-5.5 3.5 1.4-6.8L3 9.3l6.4-.9L12 2z";
const MOTIF = "M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z";

const SHAPES = [
  { path: STAR, className: "top-[14%] right-[12%] size-9", duration: "9s", delay: "0s" },
  { path: MOTIF, className: "top-[32%] right-[28%] hidden size-6 md:block", duration: "7s", delay: "-2s" },
  { path: STAR, className: "bottom-[28%] right-[8%] size-5", duration: "8s", delay: "-4s" },
  { path: MOTIF, className: "top-[10%] right-[44%] hidden size-4 lg:block", duration: "10s", delay: "-6s" },
];

export function HeroDecor() {
  return (
    <div className="absolute inset-0" aria-hidden>
      {SHAPES.map((shape, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className={`hero-float absolute text-igqs-gold-soft opacity-30 ${shape.className}`}
          style={{ "--float-duration": shape.duration, "--float-delay": shape.delay } as React.CSSProperties}
        >
          <path d={shape.path} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      ))}
      <span className="hero-float absolute top-[22%] right-[20%] size-3 rounded-full bg-igqs-gold/40" style={{ "--float-duration": "6s", "--float-delay": "-1s" } as React.CSSProperties} />
    </div>
  );
}
