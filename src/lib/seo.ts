import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/api";

export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://igqsbd.com"
).replace(/\/$/, "");

export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/curriculum",
  "/events",
  "/news",
  "/notices",
  "/gallery",
  "/contact",
  "/admission",
] as const;

/** Paths that must not be crawled or treated as the public site. */
export const PRIVATE_PATHS = [
  "/login",
  "/dashboard",
  "/content",
  "/payments",
  "/applications",
  "/admission/receipt",
  "/admission/success",
  "/admission/payments",
] as const;

export const NOINDEX: Metadata = {
  robots: { index: false, follow: false },
};

export type Crumb = { name: string; path: string };

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function publicPageMetadata({
  title,
  description,
  path,
  image,
  openGraphType = "website",
  publishedTime,
  absoluteTitle = false,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const desc = description?.replace(/\s+/g, " ").trim();
  const clipped = desc ? desc.slice(0, 160) : undefined;
  const imageUrl = image?.trim() || undefined;
  const shareImage = imageUrl
    ? [{ url: imageUrl }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Ideal Global Quranic School" }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    ...(clipped ? { description: clipped } : {}),
    alternates: { canonical },
    openGraph: {
      type: openGraphType,
      url: absoluteUrl(canonical),
      title,
      ...(clipped ? { description: clipped } : {}),
      ...(publishedTime ? { publishedTime } : {}),
      images: shareImage,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      ...(clipped ? { description: clipped } : {}),
      images: imageUrl ? [imageUrl] : ["/opengraph-image"],
    },
  };
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

function httpUrl(value: string | null | undefined) {
  const url = value?.trim() ?? "";
  return /^https?:\/\//.test(url) ? url : "";
}

export function siteGraph(site: SiteSettings) {
  const sameAs = [
    site.facebook_url,
    site.youtube_url,
    site.instagram_url,
    site.whatsapp_url,
  ]
    .map(httpUrl)
    .filter(Boolean);
  const logo = httpUrl(site.logo) || absoluteUrl("/brand/igqs-logo-256.png");
  const address = site.address?.trim();
  const telephone = site.phone_primary?.trim();
  const email = site.email?.trim();
  const orgId = `${SITE_ORIGIN}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": orgId,
        name: site.school_name,
        url: SITE_ORIGIN,
        logo,
        ...(address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: address,
                addressCountry: "BD",
              },
            }
          : {}),
        ...(telephone ? { telephone } : {}),
        ...(email ? { email } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN,
        name: site.school_name,
        inLanguage: ["bn", "en"],
        publisher: { "@id": orgId },
      },
    ],
  };
}

export function articleJsonLd({
  headline,
  description,
  path,
  datePublished,
  image,
}: {
  headline: string;
  description?: string;
  path: string;
  datePublished?: string;
  image?: string | null;
}) {
  const desc = description?.replace(/\s+/g, " ").trim();
  const imageUrl = image?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    mainEntityOfPage: absoluteUrl(path),
    ...(datePublished ? { datePublished } : {}),
    ...(desc ? { description: desc.slice(0, 160) } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

export function eventJsonLd({
  name,
  description,
  path,
  startDate,
  endDate,
  location,
  image,
}: {
  name: string;
  description?: string;
  path: string;
  startDate: string;
  endDate?: string | null;
  location?: string;
  image?: string | null;
}) {
  const desc = description?.replace(/\s+/g, " ").trim();
  const place = location?.trim();
  const imageUrl = image?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    startDate,
    url: absoluteUrl(path),
    ...(endDate ? { endDate } : {}),
    ...(place ? { location: { "@type": "Place", name: place } } : {}),
    ...(desc ? { description: desc } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}
