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

type Person = AboutPayload["leadership"][number];
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
  const ofPanel = (panel: Person["panel"]) => data.leadership.filter((person) => person.panel === panel);
  const chairman = ofPanel("chairman")[0];
  const principal = ofPanel("principal")[0];
  const directors = ofPanel("director");
  const teachers = ofPanel("teacher");
  const advisors = ofPanel("advisor");
  const chairmanMessage = (about.chairman_message || chairman?.bio || "").trim();
  const principalMessage = (about.principal_message || principal?.bio || "").trim();

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
          <SectionHeading title={t("chairAndPrincipal")} />
          <div className="grid gap-6 lg:grid-cols-2">
            <FeaturedPerson person={chairman} message={chairmanMessage} />
            <FeaturedPerson person={principal} message={principalMessage} />
          </div>
        </section>

        <PeoplePanel title={t("directors")} people={directors} empty={t("emptyDirectors")} />
        <PeoplePanel title={t("teachers")} people={teachers} empty={t("emptyTeachers")} />
        <PeoplePanel title={t("advisors")} people={advisors} empty={t("emptyAdvisors")} />

        <section>
          <SectionHeading title={t("facilities")} />
          {data.facilities.length === 0 && (
            <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
              {t("emptyFacilities")}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {data.facilities.map((item, index) => (
              <FadeIn key={item.id} delay={index * 0.08} className="group hover-lift grid overflow-hidden rounded-3xl border border-igqs-gold/20 bg-white md:grid-cols-2 night-card">
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

function FeaturedPerson({ person, message }: { person?: Person; message: string }) {
  if (!person && !message) return null;
  return (
    <FadeIn className="rounded-3xl border border-igqs-gold/25 bg-igqs-sand/40 p-6 sm:p-8 dark:bg-white/5">
      {person ? (
        <PersonIdentity
          photo={person.photo_url}
          photoAlt={person.name}
          name={person.name}
          designation={person.role}
        />
      ) : null}
      {message ? (
        <DetailsText
          text={message}
          toggle="more"
          lines={6}
          quote
          className={`${person ? "mt-5" : ""} principal-quote max-w-prose text-base leading-relaxed text-igqs-forest dark:text-igqs-gold-soft`}
        />
      ) : null}
    </FadeIn>
  );
}

function PeoplePanel({ title, people, empty }: { title: string; people: Person[]; empty: string }) {
  return (
    <section>
      <SectionHeading title={title} />
      {people.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
          {empty}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {people.map((person, index) => (
            <FadeIn key={person.id} delay={index * 0.08} className="hover-lift rounded-3xl border border-igqs-gold/20 bg-white p-5 night-card">
              <PersonIdentity photo={person.photo_url} photoAlt={person.name} name={person.name} designation={person.role} />
              {person.bio ? (
                <DetailsText text={person.bio} className="mt-4 whitespace-pre-line text-sm leading-relaxed text-igqs-muted" />
              ) : null}
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
