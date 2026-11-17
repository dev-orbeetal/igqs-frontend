"use client";

import { useTranslations } from "next-intl";
import { newsFields } from "@/lib/cms/fields";
import { ItemEditor, ItemTable } from "./CollectionBlock";
import { useMeta } from "./hooks";

export function NewsManager({ id }: { id?: string }) {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  const fields = newsFields(meta?.news_categories ?? []);
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/news/"
        hrefBase="/content/news"
        titleField="title_en"
        badge={(row) =>
          row.is_published
            ? { status: "approved", label: t("published") }
            : { status: "pending", label: t("draft") }
        }
        extra={(row) => `${row.category}${row.is_important ? ` · ${t("notice")}` : ""}`}
      />
    );
  }
  return (
    <ItemEditor
      path={id === "new" ? "/api/staff/news/new" : `/api/staff/news/${id}/`}
      fields={fields}
      defaults={{ category: "news", is_published: true, is_important: false, published_at: new Date().toISOString() }}
      listHref="/content/news"
      sectionLabel={t("news")}
    />
  );
}
