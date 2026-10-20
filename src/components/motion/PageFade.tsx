/**
 * Page transition fade. CSS-only so the page content is present and visible
 * in the server-rendered HTML — the previous framer-motion version emitted
 * <div style="opacity:0"> around every page, leaving the site blank until
 * hydration finished.
 */
export function PageFade({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
