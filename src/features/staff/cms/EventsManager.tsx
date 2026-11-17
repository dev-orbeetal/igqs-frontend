"use client";

import { useTranslations } from "next-intl";
import { eventFields } from "@/lib/cms/fields";
import { ItemEditor, ItemTable } from "./CollectionBlock";

export function EventsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/events/"
        hrefBase="/content/events"
        titleField="title_en"
        badge={(row) =>
          row.is_published
            ? { status: "approved", label: t("published") }
            : { status: "pending", label: t("draft") }
        }
        extra={(row) => String(row.location_en ?? "")}
      />
    );
  }
  return (
    <ItemEditor
      path={id === "new" ? "/api/staff/events/new" : `/api/staff/events/${id}/`}
      fields={eventFields}
      defaults={{ is_published: true }}
      listHref="/content/events"
      sectionLabel={t("events")}
    />
  );
}
