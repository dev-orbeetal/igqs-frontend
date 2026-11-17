import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsGrid } from "@/features/content/NewsGrid";
import { NEWS_CATEGORIES } from "@/features/content/categories";
import { PageIntro } from "@/components/seo/PageIntro";
import { FilterChips } from "@/components/ui/FilterChips";
import { apiGet } from "@/lib/api/client";
import type { NewsItem } from "@/lib/api/types";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return publicPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/news",
  });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const nav = await getTranslations("nav");
  const path = category ? `/api/news/?category=${category}` : "/api/news/";
  const posts = await apiGet<NewsItem[]>(path, locale);

  return (
    <div>
      <PageIntro
        title={t("title")}
        subtitle={t("subtitle")}
        crumbs={[
          { name: nav("home"), path: "/" },
          { name: t("title"), path: "/news" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <FilterChips
          param="category"
          selected={category}
          chips={NEWS_CATEGORIES.map((key) => ({ value: key, label: key ? t(key) : t("all") }))}
        />
        <NewsGrid posts={posts} locale={locale} />
      </div>
    </div>
  );
}
