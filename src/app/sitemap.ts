import type { MetadataRoute } from "next";
import { apiGet, type EventItem, type NewsItem } from "@/lib/api";
import { absoluteUrl, PUBLIC_PATHS } from "@/lib/seo";

function lastModified(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function contentPath(prefix: "/news" | "/events", slug: string) {
  if (!slug || /[/?#]/.test(slug)) return null;
  return `${prefix}/${slug}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
  }));

  const [news, events] = await Promise.all([
    apiGet<NewsItem[]>("/api/news/", "bn"),
    apiGet<{ upcoming?: EventItem[]; previous?: EventItem[] }>("/api/events/", "bn"),
  ]);

  const seen = new Set<string>(PUBLIC_PATHS);

  for (const post of news ?? []) {
    const path = contentPath("/news", post.slug);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    entries.push({
      url: absoluteUrl(path),
      lastModified: lastModified(post.published_at),
    });
  }

  for (const event of [...(events?.upcoming ?? []), ...(events?.previous ?? [])]) {
    const path = contentPath("/events", event.slug);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    entries.push({
      url: absoluteUrl(path),
      lastModified: lastModified(event.start_at),
    });
  }

  return entries;
}
