import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { Link } from "@/i18n/navigation";
import type { NewsItem } from "@/lib/api/types";
import { formatDate, newsCategoryKey } from "@/lib/format";

export async function NewsGrid({
  posts,
  locale,
}: {
  posts: NewsItem[] | null;
  locale: string;
}) {
  const t = await getTranslations("news");

  return (
    <>
      {(posts?.length ?? 0) === 0 && (
        <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
          {t("empty")}
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post, index) => (
          <FadeIn key={post.slug} delay={index * 0.08}>
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
                    className="img-zoom object-cover"
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
    </>
  );
}
