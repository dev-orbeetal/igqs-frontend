import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import { apiGet, type EventItem } from "@/lib/api";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await apiGet<EventItem>(`/api/events/${slug}/`, locale);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description?.slice(0, 160) || event.location,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160) || event.location,
      images: event.image ? [{ url: event.image }] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const event = await apiGet<EventItem>(`/api/events/${slug}/`, locale);
  // apiGet returns null for a failed request as well as a missing record, so
  // confirm the event really is absent before showing a 404 — a transient API
  // outage used to be reported to visitors as "this event doesn't exist".
  if (!event) {
    const list = await apiGet<{ upcoming: EventItem[]; previous: EventItem[] }>("/api/events/", locale);
    if (list) notFound();
    throw new Error(`Events API unavailable while loading "${slug}"`);
  }

  return (
    <div>
      <PageHero title={event.title} subtitle={t("details")} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FadeIn>
          <Link href="/events" className="link-gold inline-block">
            ← {t("backToEvents")}
          </Link>
          {event.image && (
            <div className="img-frame mt-6 mb-8 h-80 rounded-3xl">
              <Image src={event.image} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
            </div>
          )}
          <p className="mt-6 text-sm text-igqs-forest dark:text-igqs-gold">
            {t("when")}: {formatDate(event.start_at, locale, true)}
          </p>
          <p className="mt-1 text-sm text-igqs-muted">
            {t("location")}: {event.location}
          </p>
          <div className="mt-8 max-w-prose whitespace-pre-line text-lg leading-relaxed">{event.description}</div>
        </FadeIn>
      </article>
    </div>
  );
}
