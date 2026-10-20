import Link from "next/link";
import { routing } from "@/i18n/routing";
import "./globals.css";

/**
 * Root 404 for URLs that match no route at all. Without this, Next renders
 * its own unstyled English error page with no header, footer or way back to
 * the site. It can't use next-intl (there's no locale segment and therefore
 * no message provider), so the copy is written out in both languages.
 */
export default function RootNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body className="bg-igqs-cream text-igqs-ink antialiased dark:bg-[#07140f] dark:text-igqs-sand">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <p className="eyebrow">404</p>
          <h1 className="mt-3 font-display text-4xl leading-tight">পৃষ্ঠা পাওয়া যায়নি</h1>
          <p className="mt-2 font-display text-2xl text-igqs-muted">Page not found</p>
          <p className="mt-5 text-base text-igqs-muted">
            এই ঠিকানায় কোনো পৃষ্ঠা নেই। হোমপেজ থেকে আবার শুরু করুন।
            <span className="mt-1 block">
              There is no page at this address. Please start again from the homepage.
            </span>
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-igqs-green px-6 text-sm text-igqs-cream transition hover:brightness-110 dark:bg-igqs-gold dark:text-igqs-ink"
          >
            হোমপেজ / Homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
