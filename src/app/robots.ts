import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isAdminHost } from "@/lib/admin-paths";
import { PRIVATE_PATHS, SITE_ORIGIN } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (isAdminHost(await headers())) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PRIVATE_PATHS],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
