import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageIntro } from "@/components/seo/PageIntro";
import { FilterChips } from "@/components/ui/FilterChips";
import { Link } from "@/i18n/navigation";
import { apiGet, type NewsItem } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";
import { publicPageMetadata } from "@/lib/seo";

const TOPICS = ["", "notice", "admission", "holiday", "exam", "announcement", "update", "news"] as const;

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
  const selected = TOPICS.includes(topic as (typeof TOPICS)[number]) ? topic : "";
  const path = selected
    ? `/api/news/?important=1&category=${selected}`
    : "/api/news/?important=1";
  const posts = (await apiGet<NewsItem[]>(path, locale)) ?? [];

  const groups: { topic: string; items: NewsItem[] }[] = [];
  for (const post of posts) {
    const key = newsCategoryKey(post.category);
    const group = groups.find((item) => item.topic === key);
    if (group) group.items.push(post);
    else groups.push({ topic: key, items: [post] });
  }

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
          chips={TOPICS.map((key) => ({ value: key, label: key ? topics(key) : t("all") }))}
        />

        {groups.length === 0 ? (
          <p className="text-igqs-muted">{t("empty")}</p>
        ) : (
          <FadeIn className="space-y-10">
            {groups.map((group) => (
              <section key={group.topic}>
                <h2 className="text-xs uppercase tracking-[0.18em] text-igqs-forest dark:text-igqs-gold">{topics(group.topic)}</h2>
                <ul className="mt-3 divide-y divide-igqs-gold/15 overflow-hidden rounded-2xl border border-igqs-gold/20 bg-white dark:bg-[#0d1f18]">
                  {group.items.map((notice) => (
                    <li key={notice.slug}>
                      <Link
                        href={`/news/${notice.slug}`}
                        className="motion-micro flex flex-wrap items-baseline justify-between gap-3 px-5 py-4 hover:bg-igqs-gold/10"
                      >
                        <span className="font-medium">{notice.title}</span>
                        <span className="text-sm text-igqs-muted">{formatDate(notice.published_at, locale)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </FadeIn>
        )}
      </div>
    </div>
  );
}
