/**
 * Route-level skeleton. Public pages fetch their content on the server, so
 * without this a slow API leaves the user on the previous page with no
 * feedback at all (there was no loading state anywhere on the site).
 */
export default function Loading() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="border-y border-igqs-gold/30 bg-igqs-forest/90 py-12 sm:py-16 dark:bg-[#0b241c]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-3 w-32 rounded-full bg-igqs-cream/25" />
          <div className="mt-4 h-9 w-2/3 max-w-md rounded-lg bg-igqs-cream/25" />
          <div className="mt-3 h-3 w-1/2 max-w-sm rounded-full bg-igqs-cream/20" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="surface-card overflow-hidden bg-white/80 dark:bg-[#12352b]">
              <div className="h-44 bg-igqs-sand/70 dark:bg-white/5" />
              <div className="p-5">
                <div className="h-3 w-24 rounded-full bg-igqs-sand dark:bg-white/10" />
                <div className="mt-3 h-5 w-3/4 rounded-lg bg-igqs-sand dark:bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-igqs-sand/80 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
