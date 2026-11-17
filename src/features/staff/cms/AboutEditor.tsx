"use client";

import { useTranslations } from "next-intl";
import { aboutFields, facilityFields, leaderFields } from "@/lib/cms/fields";
import { SectionNav } from "./CmsFields";
import { Card } from "./CmsChrome";
import { type AboutPanel } from "./panels";
import { CollectionBlock } from "./CollectionBlock";
import { SingletonBlock } from "./SingletonBlock";

export function AboutEditor({ panel }: { panel?: AboutPanel }) {
  const t = useTranslations("cms");
  const current = panel ?? "about";
  const sections = [
    { id: "about", label: t("about"), href: "/content/about" },
    { id: "leadership", label: t("leadership"), href: "/content/about/leadership" },
    { id: "facilities", label: t("facilities"), href: "/content/about/facilities" },
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        {current === "about" && (
          <Card id="about" title={t("about")}>
            <SingletonBlock path="/api/staff/about/" fields={aboutFields} />
          </Card>
        )}
        {current === "leadership" && (
          <Card id="leadership" title={t("leadership")}>
            <CollectionBlock path="/api/staff/leaders/" fields={leaderFields} titleField="name_en" defaults={{ order: 0 }} />
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
