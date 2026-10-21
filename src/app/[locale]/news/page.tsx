import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageIntro } from "@/components/seo/PageIntro";
import { FilterChips } from "@/components/ui/FilterChips";
import { Link } from "@/i18n/navigation";
import { apiGet, type NewsItem } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";
import { publicPageMetadata } from "@/lib/seo";

const CATEGORIES = [
  "",
  "news",
  "announcement",
  "notice",
  "admission",
  "holiday",
  "exam",
  "update",
] as const;

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
          chips={CATEGORIES.map((key) => ({ value: key, label: key ? t(key) : t("all") }))}
        />
        {(posts?.length ?? 0) === 0 && (
          <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
            {t("empty")}
          </p>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <FadeIn key={post.slug}>
              <Link
                href={`/news/${post.slug}`}
                className="surface-card surface-card-hover group block overflow-hidden bg-white dark:bg-[#0d1f18]"
              >
                <div className="relative h-48">
                  {post.image && (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-igqs-forest dark:text-igqs-gold">{t(newsCategoryKey(post.category))}</p>
                  <h2 className="mt-2 font-display text-2xl">{post.title}</h2>
                  <p className="mt-2 text-sm text-igqs-muted">
                    {formatDate(post.published_at, locale)}
                  </p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
