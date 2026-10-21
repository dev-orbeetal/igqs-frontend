import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion/FadeIn";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageIntro } from "@/components/seo/PageIntro";
import { Link } from "@/i18n/navigation";
import { apiGet, type NewsItem } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";
import { articleJsonLd, NOINDEX, publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await apiGet<NewsItem>(`/api/news/${slug}/`, locale);
  if (!post) return NOINDEX;
  return publicPageMetadata({
    title: post.title,
    description: post.description?.slice(0, 160),
    path: `/news/${slug}`,
    image: post.image,
    openGraphType: "article",
    publishedTime: post.published_at,
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await apiGet<NewsItem>(`/api/news/${slug}/`, locale);
  // Only 404 when the list endpoint confirms the API is reachable; otherwise
  // a transient failure would be shown to the reader as "post not found".
  if (!post) {
    const list = await apiGet<NewsItem[]>("/api/news/", locale);
    if (list) notFound();
    throw new Error(`News API unavailable while loading "${slug}"`);
  }
  const t = await getTranslations("news");
  const nav = await getTranslations("nav");

  return (
    <div>
      <PageIntro
        title={post.title}
        subtitle={t(newsCategoryKey(post.category))}
        crumbs={[
          { name: nav("home"), path: "/" },
          { name: t("title"), path: "/news" },
          { name: post.title, path: `/news/${slug}` },
        ]}
      />
      <JsonLd
        data={articleJsonLd({
          headline: post.title,
          description: post.description,
          path: `/news/${slug}`,
          datePublished: post.published_at,
          image: post.image,
        })}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FadeIn>
          <Link href="/news" className="link-gold inline-block">
            ← {t("title")}
          </Link>
          {post.image && (
            <div className="img-frame mt-6 mb-8 h-80 rounded-3xl">
              <Image src={post.image} alt={post.title} fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
            </div>
          )}
          <p className="mt-6 text-sm text-igqs-forest dark:text-igqs-gold">{formatDate(post.published_at, locale)}</p>
          <div className="mt-6 max-w-prose whitespace-pre-line text-lg leading-relaxed">{post.description}</div>
        </FadeIn>
      </article>
    </div>
  );
}
