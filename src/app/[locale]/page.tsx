import { BookOpen, Heart, Layers, Shield } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import Image from "next/image";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import { StaffShell } from "@/components/staff/StaffShell";
import { Highlights } from "@/components/home/Highlights";
import { HeroIntro } from "@/components/home/HeroIntro";
import { Testimonials } from "@/components/home/Testimonials";
import { HeroDecor } from "@/components/home/HeroDecor";
import { HeroSlides } from "@/components/home/HeroSlides";
import { FadeIn } from "@/components/motion/FadeIn";
import { ArchCorner, MosqueWatermark, WaveEdge } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import { isAdminHost } from "@/lib/admin-paths";
import { apiGet, type HomePayload, type SiteSettings } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";
import { NOINDEX, publicPageMetadata } from "@/lib/seo";

const ICONS: Record<string, typeof BookOpen> = {
  "book-open": BookOpen,
  layers: Layers,
  heart: Heart,
  shield: Shield,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isAdminHost(await headers())) return NOINDEX;
  const t = await getTranslations({ locale, namespace: "meta" });
  return publicPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (isAdminHost(await headers())) {
    return (
      <StaffShell>
        <StaffDashboard />
      </StaffShell>
    );
  }
  const t = await getTranslations();
  const brand = await getTranslations("brand");
  const [home, site] = await Promise.all([
    apiGet<HomePayload>("/api/home/", locale),
    apiGet<SiteSettings>("/api/site/", locale),
  ]);

  const content = home?.home;
  const whyChoose = home?.why_choose ?? [];
  const highlights = home?.highlights ?? [];
  const testimonials = home?.testimonials ?? [];
  const grades = home?.curriculum_highlights ?? [];
  const events = home?.upcoming_events ?? [];
  const news = home?.latest_news ?? [];
  const albums = home?.gallery ?? [];
  const aboutImage = albums[0]?.cover_image_url || "";
  const notices = home?.notices ?? [];
  const noticeSlugs = new Set(notices.map((notice) => notice.slug));
  const newsItems = news.filter((item) => !noticeSlugs.has(item.slug));
  const heroImages = [
    ...(content?.hero_image_url ? [content.hero_image_url] : []),
    ...(home?.hero_images ?? []).filter((url) => url && url !== content?.hero_image_url),
  ];

  return (
    <div>
      <section className="on-dark hero-timeline relative flex min-h-[min(30rem,calc(100svh-4.5rem))] flex-col sm:min-h-[calc(100svh-6.5rem)] overflow-hidden bg-[#f6f1e7] dark:bg-[#0a1a14]">
        <div className="hero-parallax-bg pointer-events-none absolute inset-0">
          <HeroSlides images={heroImages} />
          <div className="hero-overlay absolute inset-0" />
          <div className="hero-pattern absolute inset-0" />
          <HeroDecor />
        </div>
        <div className="hero-parallax-fg relative flex flex-1 flex-col">
        <HeroIntro
          kicker={brand("name")}
          title={content?.hero_title}
          subtitle={content?.hero_subtitle}
          applyLabel={t("common.applyNow")}
          curriculumLabel={t("common.viewCurriculum")}
          fallbackTitle={t("home.heroFallbackTitle")}
          scrollTarget={highlights.length ? "highlights" : undefined}
          scrollLabel={t("home.scrollToContent")}
        />
        </div>
      </section>

      <Highlights items={highlights} label={t("home.highlights")} />

      {content?.welcome && (
        <section className="section-cream relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <MosqueWatermark className="pointer-events-none absolute right-[4%] bottom-10 hidden w-[min(30rem,34%)] text-igqs-gold opacity-[0.16] md:block dark:opacity-[0.08]" />
          <FadeIn className="section-shell relative">
            <SectionHeading kicker={t("brand.name")} title={t("home.welcome")} />
            <p className="quote-bar max-w-2xl whitespace-pre-line text-base leading-relaxed text-igqs-ink/85 sm:text-lg dark:text-igqs-sand/85">
              {content.welcome}
            </p>
          </FadeIn>
          <WaveEdge />
        </section>
      )}

      {(content?.about_preview || aboutImage) && (
        <section className="section-white pt-6 pb-14 sm:pb-16 lg:pb-20">
          <div className="section-shell grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {content?.about_preview && (
              <FadeIn variant="left">
                <SectionHeading title={t("home.about")} />
                <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-igqs-ink/85 sm:text-lg dark:text-igqs-sand/85">
                  {content.about_preview}
                </p>
                <Link href="/about" className="btn-green group mt-7">
                  {t("common.learnMore")}
                  <span className="nudge-x" aria-hidden>→</span>
                </Link>
              </FadeIn>
            )}
            {aboutImage && (
              <FadeIn delay={0.1} variant="right" className="img-frame-offset ml-4 mb-4 sm:ml-5">
                <div className="img-frame min-h-64 shadow-[0_18px_40px_rgb(16_35_28/0.14)] sm:min-h-80">
                  <Image
                    src={aboutImage}
                    alt={t("home.about")}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="parallax-soft object-cover"
                  />
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      )}

      {(content?.principal_message || content?.principal_name || content?.principal_photo_url) && (
        <section className="section-cream section-pad">
          <div className="section-shell">
            <FadeIn>
              <SectionHeading title={t("home.principal")} align="center" />
            </FadeIn>
            <FadeIn
              className={`surface-card relative mx-auto grid max-w-5xl gap-8 overflow-hidden border-t-4 border-t-igqs-gold bg-white p-6 md:p-10 dark:bg-[#12352b] ${
                content.principal_photo_url ? "md:grid-cols-[200px_1fr]" : ""
              }`}
            >
              {content.principal_photo_url && (
                <div
                  className="img-frame reveal relative h-56 md:h-auto md:min-h-56"
                  data-reveal="pop"
                >
                  <Image
                    src={content.principal_photo_url}
                    alt={content.principal_name}
                    fill
                    sizes="(min-width: 768px) 200px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              {(content.principal_message || content.principal_name) && (
                <blockquote>
                  {content.principal_message && (
                    <p className="principal-quote whitespace-pre-line text-lg leading-relaxed text-igqs-green sm:text-xl dark:text-igqs-gold-soft">
                      “{content.principal_message}”
                    </p>
                  )}
                  {content.principal_name && (
                    <footer className="mt-6 text-sm">
                      <strong>{content.principal_name}</strong>
                      <span className="block text-igqs-muted">{content.principal_title}</span>
                    </footer>
                  )}
                </blockquote>
              )}
            </FadeIn>
          </div>
        </section>
      )}

      {whyChoose.length > 0 && (
      <section className="band-green on-dark relative overflow-hidden section-pad">
        <ArchCorner id="why-arch-left" side="left" fit="corner" className="opacity-80" />
        <ArchCorner id="why-arch-right" side="right" fit="corner" className="opacity-80" />
        <div className="section-shell relative">
          <FadeIn>
            <SectionHeading title={t("home.why")} tone="onDark" align="center" />
          </FadeIn>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((item, i) => {
              const Icon = ICONS[item.icon] ?? BookOpen;
              return (
                <FadeIn key={item.id} delay={i * 0.08}>
                  <article className="surface-card surface-card-hover group h-full overflow-hidden border-igqs-gold/30! bg-white/[0.06] backdrop-blur-[2px] dark:bg-[#12352b]">
                    {item.image ? (
                      <div className="relative h-44 overflow-hidden border-b border-igqs-gold/45">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                          className="img-zoom object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="p-6">
                      {item.image ? null : (
                        <span className="icon-well">
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </span>
                      )}
                      <h3 className={`heading-strong text-[1.4rem] leading-snug text-white ${item.image ? "" : "mt-5"}`}>
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-igqs-cream/75">
                        {item.description}
                      </p>
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
      )}

      <Testimonials items={testimonials} />

      {grades.length > 0 && (
      <section className="section-cream section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.academics")} className="mb-0" />
            <Link href="/curriculum" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {grades.map((grade, index) => (
              <FadeIn key={grade.slug} delay={index * 0.08}>
                <Link
                  href={`/curriculum#grade-${grade.slug}`}
                  className="surface-card surface-card-hover group relative block h-full overflow-hidden bg-white/90 p-5 dark:bg-[#12352b]"
                >
                  <span className="card-accent" aria-hidden />
                  <h3 className="heading-strong flex items-baseline justify-between gap-3 text-[1.4rem] leading-snug text-igqs-green dark:text-igqs-gold-soft">
                    {grade.name}
                    <span className="nudge-x text-lg text-igqs-gold" aria-hidden>→</span>
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
      )}

      {site?.admission_open && site.admission_announcement && (
        <section className="band-green on-dark relative overflow-hidden py-14 sm:py-16">
          <ArchCorner id="cta-arch-left" side="left" fit="corner" />
          <ArchCorner id="cta-arch-right" side="right" fit="corner" />
          <FadeIn className="section-shell relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:px-12 lg:px-24">
            <div>
              <p className="eyebrow eyebrow-line">{t("home.admission")}</p>
              <p className="mt-3 max-w-prose whitespace-pre-line text-base leading-relaxed sm:text-lg">
                {site.admission_announcement}
              </p>
            </div>
            <FadeIn variant="pop" delay={0.16} className="shrink-0">
              <Link href="/admission" className="btn-gold btn-shine inline-flex">
                {t("common.applyNow")}
              </Link>
            </FadeIn>
          </FadeIn>
        </section>
      )}

      {events.length > 0 && (
      <section className="section-white section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.events")} className="mb-0" />
            <Link href="/events" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {events.map((event, index) => (
              <FadeIn key={event.slug} delay={index * 0.08}>
                <Link
                  href={`/events/${event.slug}`}
                  className="surface-card surface-card-hover group block overflow-hidden bg-white/90 dark:bg-[#12352b]"
                >
                  <div className="relative h-44">
                    {event.image && (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="img-zoom object-cover"
                      />
                    )}
                    <div className="img-overlay absolute inset-0" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-igqs-forest dark:text-igqs-gold">{formatDate(event.start_at, locale)}</p>
                    <h3 className="heading-strong mt-2 text-[1.35rem] leading-snug text-igqs-green dark:text-igqs-cream">{event.title}</h3>
                    <p className="mt-1 text-sm text-igqs-muted">{event.location}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {newsItems.length > 0 && (
      <section className="section-cream section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.news")} className="mb-0" />
            <Link href="/news" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {newsItems.map((item, index) => (
              <FadeIn key={item.slug} delay={index * 0.08}>
                <Link href={`/news/${item.slug}`} className="surface-card surface-card-hover group block overflow-hidden bg-white/90 dark:bg-[#12352b]">
                  <div className="relative h-40">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        className="img-zoom object-cover"
                      />
                    )}
                    <div className="img-overlay absolute inset-0" />
                  </div>
                  <div className="p-4">
                    <p className="eyebrow nudge-x">{t(`news.${newsCategoryKey(item.category)}`)}</p>
                    <h3 className="heading-strong mt-2 text-[1.2rem] leading-snug text-igqs-green dark:text-igqs-cream">{item.title}</h3>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {albums.length > 0 && (
      <section className="section-white section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.gallery")} className="mb-0" />
            <Link href="/gallery" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {albums.map((album, i) => (
              <FadeIn key={album.slug} delay={i * 0.08} className={i === 0 ? "col-span-2 md:row-span-2" : ""}>
                <Link href="/gallery" className="img-frame group relative block min-h-40 md:min-h-44">
                  {album.cover_image_url && (
                    <Image
                      src={album.cover_image_url}
                      alt={album.title}
                      fill
                      sizes={
                        i === 0
                          ? "(min-width: 768px) 50vw, 100vw"
                          : "(min-width: 768px) 25vw, 50vw"
                      }
                      className="img-zoom object-cover"
                    />
                  )}
                  <span className="img-overlay absolute inset-0" />
                  <span className="lift-y absolute inset-x-0 bottom-0 p-4 text-sm text-white">
                    {album.title}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {notices.length > 0 && (
        <section id="notices" className="section-cream scroll-mt-28 py-10 sm:py-12">
          <div className="section-shell">
            <div className="mb-8 flex items-end justify-between gap-4">
              <SectionHeading title={t("home.notices")} className="mb-0" />
              <Link href="/notices" className="link-gold mb-1 shrink-0">
                {t("common.viewAll")}
              </Link>
            </div>
            <ul className="surface-card divide-y divide-igqs-gold/15 overflow-hidden bg-white/90 dark:bg-[#12352b]">
              {notices.map((notice) => (
                <li
                  key={notice.slug}
                  className="reveal"
                  data-reveal="fade"
                >
                  <Link
                    href={`/news/${notice.slug}`}
                    className="notice-row motion-micro group flex flex-wrap items-baseline justify-between gap-3 px-5 py-4 hover:bg-igqs-gold/10"
                  >
                    <span className="nudge-x font-medium">{notice.title}</span>
                    <span className="text-sm text-igqs-muted">{formatDate(notice.published_at, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
