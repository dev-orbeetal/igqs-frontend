import Image from "next/image";

/** Eight-point star from the site's pattern, centred in a 100×100 box. */
const MOTIF = "M50 6 L60.5 39.5 L94 50 L60.5 60.5 L50 94 L39.5 60.5 L6 50 L39.5 39.5 Z";

/**
 * Branded loading indicator: the school crest inside a gold ring that
 * traces round, over a slowly turning eight-point motif. CSS-only, so it
 * works as a server component and in Suspense fallbacks. It fades in after
 * a short delay, so fast navigations never flash it.
 */
export function BrandLoader({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`loader-in flex flex-col items-center gap-5 ${className}`}>
      <div className="relative size-32 sm:size-36" aria-hidden>
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
          <path
            d={MOTIF}
            className="loader-motif fill-igqs-gold/10 stroke-igqs-gold/45 dark:fill-igqs-gold/10"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            className="loader-orbit fill-none stroke-igqs-gold/35"
            strokeWidth="0.8"
            strokeDasharray="1.5 4"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            className="loader-arc fill-none stroke-igqs-gold"
            strokeWidth="2.2"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="22 78"
          />
        </svg>
        <div className="loader-crest absolute inset-[24%] overflow-hidden rounded-full bg-igqs-cream shadow-[0_8px_24px_rgb(16_35_28/0.18)] ring-1 ring-igqs-gold/50 dark:bg-[#0d1f18]">
          <Image src="/brand/igqs-logo-256.png" alt="" fill sizes="80px" priority className="object-contain p-1" />
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm tracking-[0.08em] text-igqs-label">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="loader-dot size-1.5 rounded-full bg-igqs-gold"
              style={{ "--dot-index": dot } as React.CSSProperties}
            />
          ))}
        </span>
        <span>{label}</span>
      </div>
    </div>
  );
}
