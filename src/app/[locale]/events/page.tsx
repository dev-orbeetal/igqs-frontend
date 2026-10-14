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
}: {
  items: EventItem[];
  locale: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((event) => (
        <FadeIn key={event.slug}>
          <Link
            href={`/events/${event.slug}`}
            className="group block overflow-hidden rounded-3xl border border-igqs-gold/20 bg-white dark:bg-[#0d1f18]"
          >
            <div className="relative h-48">
              {event.image && (
                <Image
                  src={event.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-5">
              <p className="text-xs text-igqs-gold">{formatDate(event.start_at, locale, true)}</p>
              <h3 className="mt-2 font-display text-2xl">{event.title}</h3>
              <p className="mt-1 text-sm text-igqs-muted">{event.location}</p>
            </div>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
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
          <EventGrid items={data?.upcoming ?? []} locale={locale} />
        </section>
        <section>
          <SectionHeading title={t("previous")} />
          <EventGrid items={data?.previous ?? []} locale={locale} />
        </section>
      </div>
    </div>
  );
}
