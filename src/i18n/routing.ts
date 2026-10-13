import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "never",
  // Cookie is the only remembered choice. Middleware ignores Accept-Language
  // so a first visit stays on Bangla.
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
