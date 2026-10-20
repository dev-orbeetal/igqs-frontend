"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALES = [
  { id: "bn", label: "বাংলা" },
  { id: "en", label: "English" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("a11y");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const setLocale = (next: "en" | "bn") => {
    setOpen(false);
    if (next !== locale) router.replace(pathname, { locale: next });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("language")}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-full border border-igqs-gold/40 bg-white/70 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-igqs-ink transition hover:border-igqs-gold dark:bg-white/5 dark:text-igqs-cream"
      >
        {current.label}
        <ChevronDown className={`size-3.5 shrink-0 opacity-70 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 z-50 mt-1.5 min-w-[9.5rem] overflow-hidden rounded-xl border border-igqs-gold/30 bg-igqs-cream p-1 shadow-[0_12px_32px_rgb(16_35_28/0.12)] dark:bg-[#10261e]"
        >
          {LOCALES.map((item) => {
            const selected = item.id === locale;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setLocale(item.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected
                      ? "bg-igqs-green text-white dark:bg-igqs-gold dark:text-igqs-ink"
                      : "text-igqs-ink hover:bg-igqs-sand/80 dark:text-igqs-cream dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                  {selected && <Check className="size-3.5" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
