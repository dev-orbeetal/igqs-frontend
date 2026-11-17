import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NOTICE_TOPICS } from "@/features/content/categories";
import { NoticeList } from "@/features/content/NoticeList";
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
  const t = await getTranslations({ locale, namespace: "noticesPage" });
  return publicPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/notices",
  });
}

export default async function NoticesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { locale } = await params;
  const { topic = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("noticesPage");
  const nav = await getTranslations("nav");
  const topics = await getTranslations("news");
  const selected = NOTICE_TOPICS.includes(topic as (typeof NOTICE_TOPICS)[number]) ? topic : "";
  const path = selected
    ? `/api/news/?important=1&category=${selected}`
    : "/api/news/?important=1";
  const posts = (await apiGet<NewsItem[]>(path, locale)) ?? [];

  return (
    <div>
      <PageIntro
        title={t("title")}
        subtitle={t("subtitle")}
        crumbs={[
          { name: nav("home"), path: "/" },
          { name: t("title"), path: "/notices" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <FilterChips
          param="topic"
          selected={selected}
          chips={NOTICE_TOPICS.map((key) => ({ value: key, label: key ? topics(key) : t("all") }))}
        />
        <NoticeList posts={posts} locale={locale} />
      </div>
    </div>
  );
}
