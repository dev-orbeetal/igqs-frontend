import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero } from "@/components/ui/PageHero";
import { apiGet, type EventItem } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const event = await apiGet<EventItem>(`/api/events/${slug}/`, locale);
  if (!event) notFound();

  return (
    <div>
      <PageHero title={event.title} subtitle={t("details")} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FadeIn>
          {event.image && (
            <div className="relative mb-8 h-80 overflow-hidden rounded-3xl">
              <Image src={event.image} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
            </div>
          )}
          <p className="text-sm text-igqs-gold">
            {t("when")}: {formatDate(event.start_at, locale, true)}
          </p>
          <p className="mt-1 text-sm text-igqs-muted">
            {t("location")}: {event.location}
          </p>
          <p className="mt-8 text-lg leading-relaxed">{event.description}</p>
        </FadeIn>
      </article>
    </div>
  );
}
