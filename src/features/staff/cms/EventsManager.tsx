"use client";

import { useLocale, useTranslations } from "next-intl";
import { eventFields } from "@/lib/cms/fields";
import { formatDate } from "@/lib/format";
import { ItemEditor, ItemTable } from "./CollectionBlock";

function defaultEventStart() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

export function EventsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const locale = useLocale();
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/events/"
        hrefBase="/content/events"
        titleField="title_en"
        thumb={(row) => (typeof row.image_src === "string" ? row.image_src : "")}
        badge={(row) =>
          row.is_published
            ? { status: "approved", label: t("published") }
            : { status: "pending", label: t("draft") }
        }
        extra={(row) => {
          const when =
            typeof row.start_at === "string" && row.start_at ? formatDate(row.start_at, locale, true) : "";
          const where = String(row.location_en ?? "");
          return [when, where].filter(Boolean).join(" · ");
        }}
      />
    );
  }
  return (
    <ItemEditor
      path={id === "new" ? "/api/staff/events/new" : `/api/staff/events/${id}/`}
      fields={eventFields}
      defaults={{ is_published: true, start_at: defaultEventStart() }}
      listHref="/content/events"
      sectionLabel={t("events")}
    />
  );
}
