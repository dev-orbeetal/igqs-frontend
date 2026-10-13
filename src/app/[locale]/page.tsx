import { BookOpen, Heart, Layers, Shield } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionHeading } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import { apiGet, type HomePayload, type SiteSettings } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";

const ICONS: Record<string, typeof BookOpen> = {
  "book-open": BookOpen,
  layers: Layers,
  heart: Heart,
  shield: Shield,
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [home, site] = await Promise.all([
    apiGet<HomePayload>("/api/home/", locale),
    apiGet<SiteSettings>("/api/site/", locale),
  ]);

  if (!home || !site) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p>{t("common.loadError")}</p>
      </div>
    );
  }

  const { home: content } = home;

  return (
    <div>
      <section className="relative min-h-[86vh] overflow-hidden">
        {content.hero_image_url && (
          <Image
            src={content.hero_image_url}
            alt=""
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="hero-overlay absolute inset-0" />
        <div className="hero-pattern absolute inset-0" />
        <div className="hero-bottom-fade absolute inset-x-0 bottom-0 h-24" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6">
          <FadeIn>
            <p className="eyebrow">{site.school_name}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {content.hero_title}
            </h1>
            <div className="heading-rule mt-5" />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-igqs-cream/90 sm:text-lg">
              {content.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admission" className="btn-gold inline-flex">
                {t("common.applyNow")}
              </Link>
              <Link href="/curriculum" className="btn-gold-outline">
                {t("common.viewCurriculum")}
              </Link>
              <Link href="/contact" className="btn-ghost">
                {t("common.contactUs")}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-cream section-pad">
        <FadeIn className="section-shell">
          <SectionHeading kicker={t("brand.name")} title={t("home.welcome")} />
          <p className="max-w-3xl text-base leading-relaxed text-igqs-muted sm:text-lg dark:text-igqs-sand/80">
            {content.welcome}
          </p>
        </FadeIn>
      </section>

      <section className="section-cream pb-14 sm:pb-16 lg:pb-20">
        <div className="section-shell grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <FadeIn>
            <SectionHeading title={t("home.about")} />
            <p className="text-base leading-relaxed text-igqs-muted sm:text-lg dark:text-igqs-sand/80">
              {content.about_preview}
            </p>
            <Link href="/about" className="link-gold mt-6 inline-block font-medium">
              {t("common.learnMore")} →
            </Link>
          </FadeIn>
          <FadeIn delay={0.1} className="img-frame group min-h-72">
            <Image
              src={home.gallery[0]?.cover_image_url || content.hero_image_url}
              alt=""
              fill
              className="img-zoom object-cover"
            />
            <div className="img-overlay absolute inset-0" />
          </FadeIn>
        </div>
      </section>

      <section className="section-cream-alt section-pad">
        <div className="section-shell">
          <FadeIn>
            <SectionHeading title={t("home.principal")} />
          </FadeIn>
          <FadeIn className="surface-card grid gap-8 bg-white/90 p-6 md:grid-cols-[200px_1fr] md:p-9 dark:bg-[#12352b]">
            {content.principal_photo_url && (
              <div className="img-frame relative h-56 md:h-auto md:min-h-56">
                <Image
                  src={content.principal_photo_url}
                  alt={content.principal_name}
                  fill
                  className="img-zoom object-cover"
                />
              </div>
            )}
            <blockquote>
              <p className="font-display text-xl leading-relaxed text-igqs-green sm:text-2xl dark:text-igqs-gold-soft">
                “{content.principal_message}”
              </p>
              <footer className="mt-6 text-sm">
                <strong>{content.principal_name}</strong>
                <span className="block text-igqs-muted">{content.principal_title}</span>
              </footer>
            </blockquote>
          </FadeIn>
        </div>
      </section>

      <section className="section-forest pattern-geo-dark section-pad">
        <div className="section-shell">
          <SectionHeading title={t("home.why")} tone="onDark" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {home.why_choose.map((item, i) => {
              const Icon = ICONS[item.icon] ?? BookOpen;
              return (
                <FadeIn key={item.id} delay={i * 0.08}>
                  <article className="surface-card surface-card-hover h-full bg-[#1a4a3c]/85 p-6 dark:bg-[#12352b]">
                    <span className="icon-well">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-5 font-display text-2xl text-igqs-cream">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-igqs-cream/75">
                      {item.description}
                    </p>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-cream section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.academics")} className="mb-0" />
            <Link href="/curriculum" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {home.curriculum_highlights.map((grade) => (
              <FadeIn key={grade.slug}>
                <Link href="/curriculum" className="surface-card surface-card-hover block bg-white/90 p-5 dark:bg-[#12352b]">
                  <h3 className="font-display text-2xl text-igqs-green dark:text-igqs-gold-soft">
                    {grade.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-igqs-muted">
                    {grade.description}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {site.admission_open && (
        <section className="section-forest pattern-geo-dark py-14 sm:py-16">
          <FadeIn className="section-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">{t("home.admission")}</p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed sm:text-lg">
                {site.admission_announcement}
              </p>
            </div>
            <Link href="/admission" className="btn-gold inline-flex">
              {t("common.applyNow")}
            </Link>
          </FadeIn>
        </section>
      )}

      <section className="section-cream section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.events")} className="mb-0" />
            <Link href="/events" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {home.upcoming_events.map((event) => (
              <FadeIn key={event.slug}>
                <Link
                  href={`/events/${event.slug}`}
                  className="surface-card surface-card-hover group block overflow-hidden bg-white/90 dark:bg-[#12352b]"
                >
                  <div className="relative h-44">
                    {event.image && (
                      <Image
                        src={event.image}
                        alt=""
                        fill
                        className="img-zoom object-cover"
                      />
                    )}
                    <div className="img-overlay absolute inset-0" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-igqs-gold">{formatDate(event.start_at, locale, true)}</p>
                    <h3 className="mt-2 font-display text-2xl leading-tight">{event.title}</h3>
                    <p className="mt-1 text-sm text-igqs-muted">{event.location}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream-alt section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.news")} className="mb-0" />
            <Link href="/news" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {home.latest_news.map((item) => (
              <FadeIn key={item.slug}>
                <Link href={`/news/${item.slug}`} className="surface-card surface-card-hover group block overflow-hidden bg-white/90 dark:bg-[#12352b]">
                  <div className="relative h-40">
                    {item.image && (
                      <Image src={item.image} alt="" fill className="img-zoom object-cover" />
                    )}
                    <div className="img-overlay absolute inset-0" />
                  </div>
                  <div className="p-4">
                    <p className="eyebrow">{t(`news.${newsCategoryKey(item.category)}`)}</p>
                    <h3 className="mt-2 font-display text-xl leading-tight">{item.title}</h3>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.gallery")} className="mb-0" />
            <Link href="/gallery" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {home.gallery.map((album, i) => (
              <FadeIn key={album.slug} delay={i * 0.05} className={i === 0 ? "col-span-2 md:row-span-2" : ""}>
                <Link href="/gallery" className="img-frame group relative block min-h-40 md:min-h-44">
                  {album.cover_image_url && (
                    <Image
                      src={album.cover_image_url}
                      alt={album.title}
                      fill
                      className="img-zoom object-cover"
                    />
                  )}
                  <span className="img-overlay absolute inset-0" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-sm text-white">
                    {album.title}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream-alt section-pad">
        <div className="section-shell">
          <SectionHeading title={t("home.notices")} />
          <ul className="surface-card divide-y divide-igqs-gold/15 overflow-hidden bg-white/90 dark:bg-[#12352b]">
            {home.notices.map((notice) => (
              <li key={notice.slug}>
                <Link
                  href={`/news/${notice.slug}`}
                  className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4 transition-colors duration-500 hover:bg-igqs-gold/10"
                >
                  <span className="font-medium">{notice.title}</span>
                  <span className="text-sm text-igqs-muted">{formatDate(notice.published_at, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
