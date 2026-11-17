"use client";

import { useTranslations } from "next-intl";
import { contactFields } from "@/lib/cms/fields";
import { Card } from "./CmsChrome";
import { SingletonBlock } from "./SingletonBlock";

export function ContactEditor() {
  const t = useTranslations("cms");
  return (
    <div>
      <Card title={t("contact")}>
        <SingletonBlock path="/api/staff/site/" fields={contactFields} />
      </Card>
    </div>
  );
}
