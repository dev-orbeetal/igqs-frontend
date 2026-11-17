"use client";

import { useTranslations } from "next-intl";
import {
  heroContentFields,
  highlightFields,
  homeFields,
  homeSectionFields,
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
    { id: "highlights", label: t("highlights"), href: "/content/home/highlights" },
    { id: "page", label: t("home"), href: "/content/home/page" },
    { id: "why", label: t("whyChoose"), href: "/content/home/why" },
    { id: "testimonials", label: t("testimonials"), href: "/content/home/testimonials" },
  ];
  const current = panel ?? "hero";

  return (
    <div>
      <SectionNav sections={sections} />
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
            <div className="mt-8 border-t border-igqs-gold/20 pt-6">
              <SingletonBlock path="/api/staff/home/" fields={homeFields} />
            </div>
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
      </div>
    </div>
  );
}
