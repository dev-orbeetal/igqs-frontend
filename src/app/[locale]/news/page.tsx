import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import { apiGet, type NewsItem } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";

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
  const path = category ? `/api/news/?category=${category}` : "/api/news/";
  const posts = await apiGet<NewsItem[]>(path, locale);

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10 flex flex-wrap gap-2">
          {CATEGORIES.map((key) => (
            <Link
              key={key || "all"}
              href={key ? `/news?category=${key}` : "/news"}
              className={`rounded-full px-4 py-1.5 text-sm ${
                category === key
                  ? "bg-igqs-green text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                  : "border border-igqs-gold/30"
              }`}
            >
              {key ? t(key) : t("all")}
            </Link>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <FadeIn key={post.slug}>
              <Link
                href={`/news/${post.slug}`}
                className="img-frame block rounded-3xl bg-white dark:bg-[#0d1f18]"
              >
                <div className="relative h-48">
                  {post.image && (
                    <Image
                      src={post.image}
                      alt=""
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
