"use client";

import { useTranslations } from "next-intl";
import { aboutFields, facilityFields, leaderFields } from "@/lib/cms/fields";
import type { CmsField } from "@/lib/cms/types";
import { SectionNav } from "./CmsFields";
import { Card } from "./CmsChrome";
import { type AboutPanel } from "./panels";
import { CollectionBlock } from "./CollectionBlock";
import { SingletonBlock } from "./SingletonBlock";

const PANEL_PAGES: { id: AboutPanel; label: string; panels: string[]; fallback: string }[] = [
  { id: "leadership", label: "chairAndPrincipal", panels: ["chairman", "principal"], fallback: "chairman" },
  { id: "directors", label: "directors", panels: ["director"], fallback: "director" },
  { id: "teachers", label: "teachers", panels: ["teacher"], fallback: "teacher" },
  { id: "advisors", label: "advisors", panels: ["advisor"], fallback: "advisor" },
];

export function AboutEditor({ panel }: { panel?: AboutPanel }) {
  const t = useTranslations("cms");
  const current = panel ?? "about";
  const peopleFields: CmsField[] = leaderFields.map((field) =>
    field.type === "select"
      ? { ...field, options: field.options.map((option) => ({ value: option.value, label: t(option.label) })) }
      : field
  );
  const sections = [
    { id: "about", label: t("about"), href: "/content/about" },
    ...PANEL_PAGES.map((page) => ({ id: page.id, label: t(page.label), href: `/content/about/${page.id}` })),
    { id: "facilities", label: t("facilities"), href: "/content/about/facilities" },
  ];
  const people = PANEL_PAGES.find((page) => page.id === current);

  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        {current === "about" && (
          <Card id="about" title={t("about")}>
            <SingletonBlock path="/api/staff/about/" fields={aboutFields} />
          </Card>
        )}
        {people && (
          <Card id={people.id} title={t(people.label)}>
            <CollectionBlock
              path="/api/staff/leaders/"
              fields={peopleFields}
              titleField="name_en"
              defaults={{ order: 0, panel: people.fallback }}
              match={(row) => people.panels.includes(String(row.panel))}
            />
          </Card>
        )}
        {current === "facilities" && (
          <Card id="facilities" title={t("facilities")}>
            <CollectionBlock
              path="/api/staff/facilities/"
              fields={facilityFields}
              titleField="title_en"
              defaults={{ order: 0 }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
