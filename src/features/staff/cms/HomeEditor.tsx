"use client";

import { useTranslations } from "next-intl";
import {
  heroContentFields,
  highlightFields,
  homePeopleFields,
  homePracticalFields,
  homeSectionFields,
  homeStoryFields,
  testimonialFields,
  whyFields,
} from "@/lib/cms/fields";
import { SectionNav } from "./CmsFields";
import { Card } from "./CmsChrome";
import { type HomePanel } from "./panels";
import { CollectionBlock } from "./CollectionBlock";
import { HeroSlideEditor } from "./HeroSlideEditor";
import { useMeta } from "./hooks";
import { SingletonBlock } from "./SingletonBlock";

export function HomeEditor({ panel }: { panel?: HomePanel }) {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  const roles = [
    { value: "guardian", label: t("fRoleGuardian") },
    { value: "student", label: t("fRoleStudent") },
  ];
  const sections = [
    { id: "hero", label: t("sectionHero"), href: "/content/home" },
    { id: "story", label: t("sectionStory"), href: "/content/home/story" },
    { id: "people", label: t("people"), href: "/content/home/people" },
    { id: "highlights", label: t("highlights"), href: "/content/home/highlights" },
    { id: "why", label: t("whyChoose"), href: "/content/home/why" },
    { id: "practical", label: t("sectionPractical"), href: "/content/home/practical" },
    { id: "testimonials", label: t("testimonials"), href: "/content/home/testimonials" },
    { id: "page", label: t("extraSections"), href: "/content/home/page" },
  ];
  const current = panel ?? "hero";

  return (
    <div>
      <SectionNav sections={sections} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-igqs-gold/25 bg-white px-4 py-3 text-sm dark:bg-[#10261e]">
        <p className="text-igqs-muted">{t("previewSiteHint")}</p>
        <a href="/" target="_blank" rel="noopener noreferrer" className="font-semibold text-igqs-forest underline-offset-2 hover:underline dark:text-igqs-gold">
          {t("previewSite")}
        </a>
      </div>
      <div className="space-y-6">
        {current === "hero" && (
          <Card id="hero" title={t("sectionHero")}>
            <SingletonBlock path="/api/staff/home/" fields={heroContentFields} />
            <div className="mt-8 border-t border-igqs-gold/20 pt-6">
              <h3 className="mb-4 font-display text-xl">{t("heroSlides")}</h3>
              <HeroSlideEditor />
            </div>
          </Card>
        )}
        {current === "story" && (
          <Card id="story" title={t("sectionStory")}>
            <SingletonBlock path="/api/staff/home/" fields={homeStoryFields} />
          </Card>
        )}
        {current === "practical" && (
          <Card id="practical" title={t("sectionPractical")}>
            <SingletonBlock path="/api/staff/home/" fields={homePracticalFields} />
          </Card>
        )}
        {current === "highlights" && (
          <Card id="highlights" title={t("highlights")}>
            <CollectionBlock
              path="/api/staff/highlights/"
              fields={highlightFields(meta?.stat_icons ?? [])}
              titleField="label_en"
              defaults={{ icon: "users", order: 0, value: "" }}
            />
          </Card>
        )}
        {current === "page" && (
          <Card id="home" title={t("home")}>
            <CollectionBlock
              path="/api/staff/sections/"
              fields={homeSectionFields}
              titleField="title_en"
              defaults={{ order: 0 }}
            />
          </Card>
        )}
        {current === "people" && (
          <Card id="people" title={t("people")}>
            <p className="mb-5 text-sm leading-relaxed text-igqs-muted">{t("peopleHint")}</p>
            <SingletonBlock path="/api/staff/home/" fields={homePeopleFields} />
          </Card>
        )}
        {current === "why" && (
          <Card id="why-choose" title={t("whyChoose")}>
            <CollectionBlock
              path="/api/staff/why-choose/"
              fields={whyFields(meta?.why_icons ?? [])}
              titleField="title_en"
              defaults={{ icon: "book-open", order: 0 }}
            />
          </Card>
        )}
        {current === "testimonials" && (
          <Card id="testimonials" title={t("testimonials")}>
            <CollectionBlock
              path="/api/staff/testimonials/"
              fields={testimonialFields(roles)}
              titleField="name_en"
              defaults={{ role: "guardian", rating: 5, order: 0 }}
            />
          </Card>
        )}
        <Card title={t("relatedTitle")}>
          <p className="mb-4 text-sm leading-relaxed text-igqs-muted">{t("relatedHint")}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/content/about", label: t("sectionPurpose") },
              { href: "/content/about/facilities", label: t("facilities") },
              { href: "/content/curriculum", label: t("curriculum") },
              { href: "/content/news", label: t("news") },
              { href: "/content/events", label: t("events") },
              { href: "/content/gallery", label: t("gallery") },
            ].map((item) => (
              <li key={item.href}>
                <a href={item.href} className="font-medium text-igqs-forest underline-offset-2 hover:underline dark:text-igqs-gold">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
