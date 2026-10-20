import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Vercel otherwise redirects /api/.../ to /api/... and Django rejects the
  // slashless POST, so picture uploads never arrive.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8855" },
      { protocol: "http", hostname: "localhost", port: "8855" },
    ],
    // Next 16 refuses to optimise upstream images that resolve to a private
    // IP (SSRF protection), which breaks every CMS image in local dev
    // because Django serves media from 127.0.0.1. Production serves media
    // from the public domain, so this stays off there.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default withNextIntl(nextConfig);
