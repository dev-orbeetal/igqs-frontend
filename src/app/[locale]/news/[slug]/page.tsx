import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHero } from "@/components/ui/PageHero";
import { apiGet, type NewsItem } from "@/lib/api";
import { formatDate, newsCategoryKey } from "@/lib/format";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await apiGet<NewsItem>(`/api/news/${slug}/`, locale);
  if (!post) notFound();
  const t = await getTranslations("news");

  return (
    <div>
      <PageHero title={post.title} subtitle={t(newsCategoryKey(post.category))} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FadeIn>
          {post.image && (
            <div className="img-frame mb-8 h-80 rounded-3xl">
              <Image src={post.image} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
            </div>
          )}
          <p className="text-sm text-igqs-forest dark:text-igqs-gold">{formatDate(post.published_at, locale)}</p>
          <div className="mt-6 whitespace-pre-line text-lg leading-relaxed">
            {post.description}
          </div>
        </FadeIn>
      </article>
    </div>
  );
}
