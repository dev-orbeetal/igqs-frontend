import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageIntro } from "@/components/seo/PageIntro";
import { apiGet, type GalleryAlbum } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return publicPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/gallery",
  });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const nav = await getTranslations("nav");
  const albums = (await apiGet<GalleryAlbum[]>("/api/gallery/", locale)) ?? [];

  return (
    <div>
      <PageIntro
        title={t("title")}
        subtitle={t("subtitle")}
        crumbs={[
          { name: nav("home"), path: "/" },
          { name: t("title"), path: "/gallery" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <GalleryGrid albums={albums} />
      </div>
    </div>
  );
}
