import { BookOpen, Heart, Layers, Shield } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import Image from "next/image";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import { StaffShell } from "@/components/staff/StaffShell";
import { Highlights } from "@/components/home/Highlights";
import {
  FacilityGrid,
  FeeTable,
  HomeBand,
  LeaderMessages,
  PaymentGrid,
  ProcedureList,
  Prose,
  SplitCopy,
  VisionMission,
} from "@/components/home/HomeSections";
import { HeroIntro } from "@/components/home/HeroIntro";
import { Testimonials } from "@/components/home/Testimonials";
import { HeroDecor } from "@/components/home/HeroDecor";
import { HeroSlides } from "@/components/home/HeroSlides";
import { FadeIn } from "@/components/motion/FadeIn";
import { ArchCorner } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import { isAdminHost } from "@/lib/admin-paths";
import { apiGet, type AboutPayload, type AdmissionInfo, type HomePayload, type SiteSettings } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";
import { NOINDEX, publicPageMetadata } from "@/lib/seo";

function filled(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const text = (value ?? "").trim();
    if (text) return text;
  }
  return "";
}

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
  const [home, site, aboutPage, admission] = await Promise.all([
    apiGet<HomePayload>("/api/home/", locale),
    apiGet<SiteSettings>("/api/site/", locale),
    apiGet<AboutPayload>("/api/about/", locale),
    apiGet<AdmissionInfo>("/api/admissions/info/", locale),
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
  const goals = filled(content?.goals, content?.about_preview, t("home.goalsBody"));
  const beacon = filled(content?.beacon, content?.welcome, t("home.beaconBody"));
  const dreams = filled(content?.dreams, t("home.dreamsBody"));
  const gain = filled(content?.child_gain, t("home.gainBody"));
  const holistic = filled(content?.holistic, t("home.holisticBody"));
  const proceduresNote = filled(content?.admission_procedures);
  const tuition = filled(content?.tuition, t("home.tuitionBody"));
  const uniform = filled(content?.uniform, t("home.uniformBody"));
  const vision = filled(aboutPage?.about?.vision, t("home.visionBody"));
  const mission = filled(aboutPage?.about?.mission, t("home.missionBody"));
  const facilities = aboutPage?.facilities ?? [];
  const fees = admission?.fees ?? [];
  const methods = admission?.methods ?? [];
  const chairmanShown = Boolean(content?.chairman_message || content?.chairman_name || content?.chairman_photo_url);
  const principalShown = Boolean(content?.principal_message || content?.principal_name || content?.principal_photo_url);
  const messageHeading =
    chairmanShown && principalShown
      ? t("home.messages")
      : chairmanShown
        ? t("home.chairman")
        : t("home.principal");
  const procedureSteps = [1, 2, 3, 4, 5].map((step) => t(`home.procedure${step}`));

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
          scrollTarget="goals"
          scrollLabel={t("home.scrollToContent")}
        />
        </div>
      </section>

      <HomeBand id="goals" title={t("home.goals")} tone="cream">
        <Prose>{goals}</Prose>
      </HomeBand>

      <SplitCopy
        id="beacon"
        title={t("home.beacon")}
        body={beacon}
        image={aboutImage}
        imageAlt={t("home.beacon")}
      />

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

      <VisionMission
        visionTitle={t("home.vision")}
        vision={vision}
        missionTitle={t("home.mission")}
        mission={mission}
      />

      {whyChoose.length > 0 && (
      <section id="why" className="band-green on-dark relative scroll-mt-28 overflow-hidden section-pad">
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

      <HomeBand id="dreams" title={t("home.dreams")} tone="cream">
        <Prose>{dreams}</Prose>
      </HomeBand>

      <HomeBand id="gain" title={t("home.gain")} tone="white">
        <Prose>{gain}</Prose>
      </HomeBand>

      <HomeBand id="holistic" title={t("home.holistic")} tone="cream">
        <Prose>{holistic}</Prose>
      </HomeBand>

      <HomeBand id="facilities" title={t("home.facilities")} tone="white">
        {facilities.length > 0 ? <FacilityGrid items={facilities} /> : <Prose>{t("home.facilitiesBody")}</Prose>}
      </HomeBand>

      <HomeBand id="admission" title={t("home.procedures")} tone="cream">
        {site?.admission_announcement ? <Prose>{site.admission_announcement}</Prose> : null}
        {proceduresNote ? <div className={site?.admission_announcement ? "mt-6" : ""}><Prose>{proceduresNote}</Prose></div> : null}
        <div className={site?.admission_announcement || proceduresNote ? "mt-6" : ""}>
          <ProcedureList steps={procedureSteps} applyHref="/admission" applyLabel={t("common.applyNow")} />
        </div>
      </HomeBand>

      <HomeBand id="tuition" title={t("home.tuition")} tone="white">
        <Prose>{tuition}</Prose>
      </HomeBand>

      <HomeBand id="payments" title={t("home.payments")} tone="cream">
        {methods.length > 0 ? <PaymentGrid methods={methods} /> : <Prose>{t("home.paymentsEmpty")}</Prose>}
      </HomeBand>

      <HomeBand id="uniform" title={t("home.uniform")} tone="white">
        <Prose>{uniform}</Prose>
      </HomeBand>

      <HomeBand id="fees" title={t("home.fees")} tone="cream">
        <Prose>{fees.length > 0 ? t("home.feesIntro") : t("home.feesEmpty")}</Prose>
        {fees.length > 0 ? (
          <div className="mt-6">
            <FeeTable fees={fees} allClassesLabel={t("home.feesAllClasses")} />
          </div>
        ) : null}
      </HomeBand>

      <section id="curriculum" className="section-white section-pad scroll-mt-28">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading title={t("home.curriculum")} className="mb-0" />
            <Link href="/curriculum" className="link-gold mb-1 shrink-0">
              {t("common.viewAll")}
            </Link>
          </div>
          {grades.length === 0 ? (
            <p className="text-igqs-muted">{t("curriculum.empty")}</p>
          ) : (
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
          )}
        </div>
      </section>

      <Testimonials items={testimonials} />

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
