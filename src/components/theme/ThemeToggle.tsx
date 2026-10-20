"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("a11y");
  const [ready, setReady] = useState(false);
  const dark = resolvedTheme === "dark";

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => ready && setTheme(dark ? "light" : "dark")}
      className="inline-flex size-11 items-center justify-center rounded-full border border-igqs-gold/40 text-igqs-ink transition-colors duration-200 hover:bg-igqs-gold/15 dark:text-igqs-cream"
      aria-label={ready ? (dark ? t("light") : t("dark")) : t("dark")}
    >
      {ready && dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
