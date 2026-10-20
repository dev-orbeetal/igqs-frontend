import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero, SectionHeading } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import { apiGet, type EventItem } from "@/lib/api";
import { formatDate } from "@/lib/format";

function EventGrid({
  items,
  locale,
  empty,
}: {
  items: EventItem[];
  locale: string;
  empty: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
        {empty}
      </p>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((event) => (
        <FadeIn key={event.slug}>
          <Link
            href={`/events/${event.slug}`}
            className="surface-card surface-card-hover group block overflow-hidden bg-white dark:bg-[#0d1f18]"
          >
            <div className="relative h-48">
              {event.image && (
                <Image
                  src={event.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="img-zoom object-cover"
                />
              )}
            </div>
            <div className="p-5">
              <p className="text-xs text-igqs-forest dark:text-igqs-gold">{formatDate(event.start_at, locale, true)}</p>
              <h3 className="mt-2 font-display text-2xl">{event.title}</h3>
              <p className="mt-1 text-sm text-igqs-muted">{event.location}</p>
            </div>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/events" } };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const data = await apiGet<{ upcoming: EventItem[]; previous: EventItem[] }>(
    "/api/events/",
    locale
  );

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6">
        <section>
          <SectionHeading title={t("upcoming")} />
          <EventGrid items={data?.upcoming ?? []} locale={locale} empty={t("emptyUpcoming")} />
        </section>
        <section>
          <SectionHeading title={t("previous")} />
          <EventGrid items={data?.previous ?? []} locale={locale} empty={t("emptyPrevious")} />
        </section>
      </div>
    </div>
  );
}
