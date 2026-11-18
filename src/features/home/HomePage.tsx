import { BookOpen, Heart, Layers, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Highlights } from "@/features/home/Highlights";
import {
  FacilityGrid,
  HomeBand,
  LeaderMessages,
  Prose,
  SplitCopy,
  VisionMission,
} from "@/features/home/HomeSections";
import { HeroFeatures } from "@/features/home/HeroFeatures";
import { HeroIntro } from "@/features/home/HeroIntro";
import { Testimonials } from "@/features/home/Testimonials";
import { HeroDecor } from "@/features/home/HeroDecor";
import { HeroSlides } from "@/features/home/HeroSlides";
import { FormattedText } from "@/components/content/FormattedText";
import { FadeIn } from "@/components/motion/FadeIn";
import { ArchCorner } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import type { AboutPayload, HomePayload, SiteSettings } from "@/lib/api/types";
import { formatDate, newsCategoryKey } from "@/lib/format";
import { buildHomeContent } from "@/features/home/content";
import { CulturalSection } from "@/features/home/CulturalSection";

const ICONS: Record<string, typeof BookOpen> = {
  "book-open": BookOpen,
  layers: Layers,
  heart: Heart,
  shield: Shield,
};

type WhyItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string;
};

function WhyCard({ item }: { item: WhyItem }) {
  const Icon = ICONS[item.icon] ?? BookOpen;
  return (
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
        <FormattedText text={item.description} className="mt-2 text-sm leading-relaxed text-igqs-cream/75" />
      </div>
    </article>
  );
}

export async function HomePage({
  locale,
  home,
  site,
  aboutPage,
}: {
  locale: string;
  home: HomePayload | null;
  site: SiteSettings | null;
  aboutPage: AboutPayload | null;
}) {
  const t = await getTranslations();
  const brand = await getTranslations("brand");
  const view = buildHomeContent(home, site, aboutPage, null, {
    messages: t("home.messages"),
    chairman: t("home.chairman"),
    principal: t("home.principal"),
    procedureSteps: [1, 2, 3, 4, 5].map((step) => t(`home.procedure${step}`)),
  });
  const {
    content,
    whyChoose,
    highlights,
    testimonials,
    grades,
    events,
    albums,
    notices,
    newsItems,
    heroImages,
    sections,
    goals,
    beacon,
    dreams,
    gain,
    tuition,
    uniform,
    vision,
    mission,
    facilities,
    messageHeading,
  } = view;

  return (
    <div>
      <section className="on-dark hero-timeline relative flex min-h-[min(30rem,calc(100svh-4.5rem))] flex-col sm:min-h-[calc(100svh-6.5rem)] overflow-hidden bg-[#f6f1e7] dark:bg-[#0a1a14]">
        <div className="hero-parallax-bg pointer-events-none absolute inset-0">
          <HeroSlides images={heroImages} />
          <div className="hero-overlay absolute inset-0" />
          <div className="hero-pattern absolute inset-0" />
          <HeroDecor />
        </div>
        <div className="hero-parallax-fg pointer-events-none relative flex flex-1 flex-col">
        <HeroIntro
          kicker={brand("name")}
          title={content?.hero_title}
          subtitle={content?.hero_subtitle}
          applyLabel={t("common.applyNow")}
          curriculumLabel={t("common.viewCurriculum")}
          fallbackTitle={t("home.heroFallbackTitle")}
          scrollTarget={goals ? "goals" : undefined}
          scrollLabel={t("home.scrollToContent")}
        />
        </div>
      </section>

      <HeroFeatures />

      {sections.map((section, index) => (
        <HomeBand
          key={section.id}
          id={`section-${section.id}`}
          title={section.title}
          tone={index % 2 === 0 ? "cream" : "white"}
        >
          <Prose>{section.description}</Prose>
        </HomeBand>
      ))}

      {sections.length === 0 && goals ? (
        <HomeBand id="goals" title={t("home.goals")} tone="cream">
          <Prose>{goals}</Prose>
        </HomeBand>
      ) : null}

      {sections.length === 0 && beacon ? (
        <SplitCopy
          id="beacon"
          title={t("home.beacon")}
          body={beacon}
          image="/home/beacon.jpg"
          imageAlt={t("home.beacon")}
        />
      ) : null}

      <LeaderMessages
        id="messages"
        heading={messageHeading}
        people={[
          {
            label: t("home.chairman"),
            name: content?.chairman_name,
            title: content?.chairman_title,
            message: content?.chairman_message,
            photo: content?.chairman_photo_url,
          },
          {
            label: t("home.principal"),
            name: content?.principal_name,
            title: content?.principal_title,
            message: content?.principal_message,
            photo: content?.principal_photo_url,
          },
        ]}
      />

      <Highlights items={highlights} label={t("home.glance")} title={t("home.glance")} />

      {vision || mission ? (
        <VisionMission
          visionTitle={t("home.vision")}
          vision={vision}
          missionTitle={t("home.mission")}
          mission={mission}
        />
      ) : null}

      {whyChoose.length > 0 && (
      <section id="why" className="band-green on-dark relative scroll-mt-28 overflow-hidden section-pad">
        <ArchCorner id="why-arch-left" side="left" fit="corner" className="opacity-80" />
        <ArchCorner id="why-arch-right" side="right" fit="corner" className="opacity-80" />
        <div className="section-shell relative">
          <FadeIn>
            <SectionHeading title={t("home.why")} tone="onDark" align="center" />
          </FadeIn>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whyChoose.slice(0, 4).map((item, index) => (
              <FadeIn key={item.id} delay={index * 0.08}>
                <WhyCard item={item} />
              </FadeIn>
            ))}
          </div>
          {whyChoose.length > 4 ? (
            <details className="details-toggle details-center mt-6">
              <summary className="details-action link-arrow">
                <span className="details-closed">{t("common.details")}</span>
                <span className="details-open">{t("common.closeDetails")}</span>
              </summary>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {whyChoose.slice(4).map((item, index) => (
                  <FadeIn key={item.id} delay={index * 0.08}>
                    <WhyCard item={item} />
                  </FadeIn>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </section>
      )}

      <section className="section-cream border-y border-igqs-gold/25">
        <div className="section-shell py-8 sm:py-10">
          <Link
            href="/admission"
            className="surface-card surface-card-hover group flex cursor-pointer items-center justify-between gap-4 bg-white px-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-igqs-forest dark:bg-[#12352b] dark:focus-visible:outline-igqs-gold-soft"
          >
            <span>
              <span className="heading-strong block text-2xl text-igqs-green transition-colors duration-200 group-hover:text-igqs-forest dark:text-igqs-gold-soft">
                {t("home.admissionDetails")}
              </span>
              <span className="mt-1 block text-sm text-igqs-muted">{t("home.admissionDetailsHint")}</span>
            </span>
            <span
              aria-hidden
              className="nudge-x inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-igqs-gold text-xl leading-none text-igqs-ink shadow-[0_8px_18px_rgb(196_163_90/0.35)] transition-colors duration-200 group-hover:bg-[#d4b56a]"
            >
              →
            </span>
          </Link>
        </div>
      </section>

      {sections.length === 0 && tuition ? (
        <HomeBand id="tuition" title={t("home.tuition")} tone="white">
          <Prose>{tuition}</Prose>
        </HomeBand>
      ) : null}

      {sections.length === 0 && uniform ? (
        <HomeBand id="uniform" title={t("home.uniform")} tone="white">
          <Prose>{uniform}</Prose>
        </HomeBand>
      ) : null}

      {facilities.length > 0 ? (
        <HomeBand id="facilities" title={t("home.facilities")} tone="white">
          <FacilityGrid items={facilities} />
        </HomeBand>
      ) : null}

      {sections.length === 0 && dreams ? (
        <HomeBand id="dreams" title={t("home.dreams")} tone="cream">
          <Prose>{dreams}</Prose>
        </HomeBand>
      ) : null}

      {sections.length === 0 && gain ? (
        <HomeBand id="gain" title={t("home.gain")} tone="white">
          <Prose>{gain}</Prose>
        </HomeBand>
      ) : null}

      <CulturalSection />

      <div className="band-flow">
      {grades.length > 0 ? (
      <section id="curriculum" className="band section-pad scroll-mt-28">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.curriculum")} className="mb-0" />
            <Link href="/curriculum" className="link-gold link-arrow mb-1 shrink-0">
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
                    <FormattedText text={grade.description} className="mt-2 line-clamp-3 text-sm leading-relaxed text-igqs-muted" />
                  </Link>
                </FadeIn>
              ))}
            </div>
        </div>
      </section>
      ) : null}

      <Testimonials items={testimonials} />

      {events.length > 0 && (
      <section className="band section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.events")} className="mb-0" />
            <Link href="/events" className="link-gold link-arrow mb-1 shrink-0">
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
      <section className="band section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.news")} className="mb-0" />
            <Link href="/news" className="link-gold link-arrow mb-1 shrink-0">
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
      <section className="band section-pad">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.gallery")} className="mb-0" />
            <Link href="/gallery" className="link-gold link-arrow mb-1 shrink-0">
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
        <section id="notices" className="band scroll-mt-28 py-10 sm:py-12">
          <div className="section-shell">
            <div className="mb-8 flex items-end justify-between gap-4">
              <SectionHeading title={t("home.notices")} className="mb-0" />
              <Link href="/notices" className="link-gold link-arrow mb-1 shrink-0">
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
    </div>
  );
}
