import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { DetailsText } from "@/features/home/DetailsText";
import { PersonIdentity } from "@/features/home/HomeSections";
import { PageIntro } from "@/components/seo/PageIntro";
import { SectionHeading } from "@/components/ui/PageHero";
import { apiGet } from "@/lib/api/client";
import { type AboutPayload } from "@/lib/api/types";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return publicPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/about",
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const nav = await getTranslations("nav");
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
  const isAdvisor = (role: string) => /advisor|উপদেষ্টা/i.test(role);
  // The school's own principal has a dedicated message below. Other
  // "Principal" titles belong to advisors of other institutions.
  const isSchoolPrincipal = (role: string) =>
    /principal|অধ্যক্ষ|প্রিন্সিপাল/i.test(role) && !isAdvisor(role);
  const advisors = data.leadership.filter((person) => isAdvisor(person.role));
  const principal = data.leadership.find((person) => isSchoolPrincipal(person.role));
  const leaders = data.leadership.filter(
    (person) => !isAdvisor(person.role) && person.id !== principal?.id,
  );
  const principalMessage = about.principal_message.trim();

  return (
    <div>
      <PageIntro
        title={t("title")}
        subtitle={t("subtitle")}
        crumbs={[
          { name: nav("home"), path: "/" },
          { name: t("title"), path: "/about" },
        ]}
      />
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        <section>
          <SectionHeading title={t("introduction")} />
          <FadeIn>
            <DetailsText
              text={about.introduction}
              className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-igqs-muted dark:text-igqs-sand/80"
            />
          </FadeIn>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn className="rounded-3xl bg-igqs-forest p-8 text-igqs-cream">
            <h2 className="font-display text-3xl text-igqs-gold">{t("vision")}</h2>
            <DetailsText text={about.vision} className="mt-4 max-w-prose whitespace-pre-line leading-relaxed" />
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-3xl border border-igqs-gold/25 p-8">
            <h2 className="font-display text-3xl text-igqs-forest dark:text-igqs-gold-soft">
              {t("mission")}
            </h2>
            <DetailsText
              text={about.mission}
              className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-igqs-muted dark:text-igqs-sand/80"
            />
          </FadeIn>
        </div>

        <section>
          <SectionHeading title={t("history")} />
          <FadeIn>
            <DetailsText
              text={about.history}
              className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-igqs-muted dark:text-igqs-sand/80"
            />
          </FadeIn>
        </section>

        <section>
          <SectionHeading title={t("quranic")} />
          <FadeIn>
            <DetailsText
              text={about.quranic_approach}
              className="max-w-prose whitespace-pre-line text-lg leading-relaxed text-igqs-muted dark:text-igqs-sand/80"
            />
          </FadeIn>
        </section>

        <section>
          <SectionHeading title={t("leadership")} />
          {leaders.length === 0 && advisors.length === 0 && (
            <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
              {t("emptyLeadership")}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {leaders.map((person, index) => (
              <FadeIn key={person.id} delay={index * 0.08} className="hover-lift rounded-3xl border border-igqs-gold/20 bg-white p-5 dark:bg-[#0d1f18]">
                <PersonIdentity photo={person.photo_url} photoAlt={person.name} name={person.name} designation={person.role} />
                {person.bio ? <DetailsText text={person.bio} className="mt-4 whitespace-pre-line text-sm leading-relaxed text-igqs-muted" /> : null}
              </FadeIn>
            ))}
          </div>
        </section>

        {advisors.length > 0 ? (
          <section>
            <SectionHeading title={t("advisors")} />
            <div className="grid gap-6">
              {advisors.map((person, index) => (
                <FadeIn key={person.id} delay={index * 0.05} className="hover-lift rounded-3xl border border-igqs-gold/20 bg-white p-5 sm:p-6 dark:bg-[#0d1f18]">
                  <PersonIdentity photo={person.photo_url} photoAlt={person.name} name={person.name} designation={person.role} />
                  {person.bio ? (
                    <DetailsText
                      text={person.bio}
                      lines={6}
                      className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-igqs-muted dark:text-igqs-sand/80"
                    />
                  ) : null}
                </FadeIn>
              ))}
            </div>
          </section>
        ) : null}

        {principal || principalMessage ? (
          <FadeIn className="rounded-3xl border border-igqs-gold/25 bg-igqs-sand/40 p-8 dark:bg-white/5">
            <SectionHeading title={t("principal")} rise={false} />
            {principal ? (
              <PersonIdentity
                photo={principal.photo_url}
                photoAlt={principal.name}
                name={principal.name}
                designation={principal.role}
              />
            ) : null}
            {principalMessage ? (
              <DetailsText
                text={principalMessage}
                toggle="more"
                lines={6}
                quote
                className={`${principal ? "mt-5" : ""} principal-quote max-w-prose text-base leading-relaxed text-igqs-forest dark:text-igqs-gold-soft`}
              />
            ) : null}
          </FadeIn>
        ) : null}

        <section>
          <SectionHeading title={t("facilities")} />
          {data.facilities.length === 0 && (
            <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
              {t("emptyFacilities")}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {data.facilities.map((item, index) => (
              <FadeIn key={item.id} delay={index * 0.08} className="group hover-lift grid overflow-hidden rounded-3xl border border-igqs-gold/20 bg-white md:grid-cols-2 dark:bg-[#0d1f18]">
                <div className="img-frame min-h-44 rounded-none border-y-0 border-l-0">
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 25vw, 100vw"
                      className="img-zoom object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <DetailsText text={item.description} className="mt-2 text-sm leading-relaxed text-igqs-muted" />
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
