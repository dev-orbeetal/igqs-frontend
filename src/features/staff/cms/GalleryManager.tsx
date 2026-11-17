"use client";

import { useTranslations } from "next-intl";
import { albumFields } from "@/lib/cms/fields";
import { SectionNav } from "./CmsFields";
import { AlbumImages } from "./AlbumImages";
import { Card } from "./CmsChrome";
import { ItemEditor, ItemTable } from "./CollectionBlock";
import { useMeta } from "./hooks";
import { type GalleryPanel } from "./panels";

export function GalleryManager({ id, panel }: { id?: string; panel?: GalleryPanel }) {
  const t = useTranslations("cms");
  const { meta } = useMeta();
  const fields = albumFields(meta?.gallery_categories ?? []);
  if (!id) {
    return (
      <ItemTable
        path="/api/staff/albums/"
        hrefBase="/content/gallery"
        titleField="title_en"
        extra={(row) => String(row.category)}
      />
    );
  }
  const base = `/content/gallery/${id}`;
  const current = panel ?? "details";
  const sections = [
    { id: "details", label: t("sectionDetails"), href: base },
    ...(id !== "new" ? [{ id: "images", label: t("images"), href: `${base}/images` }] : []),
  ];
  return (
    <div>
      <SectionNav sections={sections} />
      <div className="space-y-6">
        {current === "details" && (
          <ItemEditor
            cardId="details"
            path={id === "new" ? "/api/staff/albums/new" : `/api/staff/albums/${id}/`}
            fields={fields}
            defaults={{ category: "campus", order: 0 }}
            listHref="/content/gallery"
            sectionLabel={t("gallery")}
          />
        )}
        {current === "images" && id !== "new" && (
          <Card id="images" title={t("images")}>
            <AlbumImages albumId={id} />
          </Card>
        )}
      </div>
    </div>
  );
}
