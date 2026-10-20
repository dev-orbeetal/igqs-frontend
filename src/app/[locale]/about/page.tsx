import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero, SectionHeading } from "@/components/ui/PageHero";
import { apiGet, type AboutPayload } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("subtitle"), alternates: { canonical: "/about" } };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tc = await getTranslations("common");
  const data = await apiGet<AboutPayload>("/api/about/", locale);
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p>{tc("loadError")}</p>
      </div>
    );
  }
  const { about } = data;

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        <FadeIn>
          <SectionHeading title={t("introduction")} />
          <p className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-igqs-muted dark:text-igqs-sand/80">
            {about.introduction}
          </p>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn className="rounded-3xl bg-igqs-forest p-8 text-igqs-cream">
            <h2 className="font-display text-3xl text-igqs-gold">{t("vision")}</h2>
            <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed">{about.vision}</p>
          </FadeIn>
          <FadeIn className="rounded-3xl border border-igqs-gold/25 p-8">
            <h2 className="font-display text-3xl text-igqs-forest dark:text-igqs-gold-soft">
              {t("mission")}
            </h2>
            <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-igqs-muted dark:text-igqs-sand/80">
              {about.mission}
            </p>
          </FadeIn>
        </div>

        <FadeIn>
          <SectionHeading title={t("history")} />
          <p className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-igqs-muted dark:text-igqs-sand/80">
            {about.history}
          </p>
        </FadeIn>

        <FadeIn>
          <SectionHeading title={t("quranic")} />
          <p className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-igqs-muted dark:text-igqs-sand/80">
            {about.quranic_approach}
          </p>
        </FadeIn>

        <section>
          <SectionHeading title={t("leadership")} />
          {data.leadership.length === 0 && (
            <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
              {t("emptyLeadership")}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {data.leadership.map((person) => (
              <FadeIn key={person.id} className="overflow-hidden rounded-3xl border border-igqs-gold/20 bg-white dark:bg-[#0d1f18]">
                <div className="img-frame h-64 rounded-none rounded-t-3xl border-b-0">
                  {person.photo_url && (
                    <Image
                      src={person.photo_url}
                      alt={person.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl">{person.name}</h3>
                  <p className="text-sm text-igqs-forest dark:text-igqs-gold">{person.role}</p>
                  <p className="mt-3 text-sm text-igqs-muted">{person.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <FadeIn className="rounded-3xl border border-igqs-gold/25 bg-igqs-sand/40 p-8 dark:bg-white/5">
          <SectionHeading title={t("principal")} />
          <p className="max-w-prose whitespace-pre-line font-display text-2xl leading-relaxed text-igqs-forest dark:text-igqs-gold-soft">
            {about.principal_message}
          </p>
        </FadeIn>

        <section>
          <SectionHeading title={t("facilities")} />
          {data.facilities.length === 0 && (
            <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
              {t("emptyFacilities")}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {data.facilities.map((item) => (
              <FadeIn key={item.id} className="grid overflow-hidden rounded-3xl border border-igqs-gold/20 bg-white md:grid-cols-2 dark:bg-[#0d1f18]">
                <div className="img-frame min-h-44 rounded-none border-y-0 border-l-0">
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm text-igqs-muted">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
