/**
 * Decorative pieces of the site's visual language (all aria-hidden):
 * gold-edged arch corners with a faint star lattice for green bands, the
 * open-book mark for centred headings, and a brush-stroke underline.
 * Same shapes as the receipt.
 */

const STAR = "M11 2l2.6 6.4L20 11l-6.4 2.6L11 20l-2.6-6.4L2 11l6.4-2.6z";

function Lattice({ id }: { id: string }) {
  return (
    <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
      <path d={STAR} fill="none" stroke="#c4a35a" strokeOpacity="0.3" strokeWidth="0.7" />
    </pattern>
  );
}

/** Scalloped dome edge rising toward the top-right corner. */
const ARCH_RIGHT =
  "M0 170C4 142 18 131 38 126c20-5 23-24 31-37 10-17 29-22 45-26 20-6 25-27 34-42C156 8 173 2 200 0";
/** Smooth sweep from the left edge up to the top. */
const ARCH_LEFT = "M0 158C44 148 92 118 120 70 140 36 164 10 200 0";

/**
 * Corner ornament for green bands. `id` must be unique on the page (it
 * names the SVG pattern). Hidden on small screens, where it would crowd
 * the content.
 */
export function ArchCorner({
  id,
  side,
  fit = "band",
  className = "",
}: {
  id: string;
  side: "left" | "right";
  /** "band": spans the height of a short band (stats strip, page header).
   *  "corner": a fixed-size corner piece for tall sections. */
  fit?: "band" | "corner";
  className?: string;
}) {
  const right = side === "right";
  const edge = right ? ARCH_RIGHT : ARCH_LEFT;
  const area = right ? `${edge}V170Z` : `${edge}H0Z`;
  const size =
    fit === "band"
      ? "inset-y-0 h-full w-[min(16rem,22%)]"
      : `h-28 w-36 lg:h-36 lg:w-44 ${right ? "bottom-0" : "top-0"}`;
  return (
    <svg
      viewBox="0 0 200 170"
      preserveAspectRatio={`${right ? "xMaxYMax" : "xMinYMin"} ${fit === "band" ? "slice" : "meet"}`}
      className={`pointer-events-none absolute hidden md:block ${size} ${right ? "right-0" : "left-0"} ${className}`}
      aria-hidden
    >
      <defs>
        <Lattice id={id} />
      </defs>
      <path d={area} fill="#1b6a50" fillOpacity="0.45" />
      <path d={area} fill={`url(#${id})`} />
      <path d={edge} fill="none" stroke="#c4a35a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Open book: the mark above centred section titles. */
export function BookMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M32 31C24 25 14 24 4 27V6c10-3 20-2 28 5 8-7 18-8 28-5v21c-10-3-20-2-28 4z" />
      <path d="M32 11v20" />
      <path d="M10 13c6-1.5 11-1 16 1.5M10 18c6-1.5 11-1 16 1.5M38 14.5c5-2.5 10-3 16-1.5M38 19.5c5-2.5 10-3 16-1.5" />
      <path d="M2 30c10-3 20-2 30 4 10-6 20-7 30-4" />
    </svg>
  );
}

/** Tapered gold brush stroke under left-aligned headings. */
export function Swoosh({ className = "", draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 18"
      preserveAspectRatio="none"
      className={draw ? `reveal ${className}` : className}
      data-reveal={draw ? "draw" : undefined}
      // RevealObserver may tag this before a client parent hydrates.
      suppressHydrationWarning
      aria-hidden
    >
      <path d="M2 15C46 5 120 1 198 4c-62 3-126 8-186 14-6 .6-12 0-10-3z" fill="#c4a35a" />
    </svg>
  );
}
