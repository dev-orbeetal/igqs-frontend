import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/FadeIn";
import { Link } from "@/i18n/navigation";
import type { NewsItem } from "@/lib/api/types";
import { formatDate, newsCategoryKey } from "@/lib/format";

export function groupNotices(posts: NewsItem[]) {
  const groups: { topic: string; items: NewsItem[] }[] = [];
  for (const post of posts) {
    const key = newsCategoryKey(post.category);
    const group = groups.find((item) => item.topic === key);
    if (group) group.items.push(post);
    else groups.push({ topic: key, items: [post] });
  }
  return groups;
}

export async function NoticeList({
  posts,
  locale,
}: {
  posts: NewsItem[];
  locale: string;
}) {
  const t = await getTranslations("noticesPage");
  const topics = await getTranslations("news");
  const groups = groupNotices(posts);

  if (groups.length === 0) {
    return <p className="text-igqs-muted">{t("empty")}</p>;
  }

  return (
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
  );
}
