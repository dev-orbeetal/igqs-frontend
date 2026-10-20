"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

export type FilterChip = { value: string; label: string };

/**
 * Category filters for the news and notices lists. These were plain links
 * that triggered a full server navigation with no feedback — tapping a chip
 * appeared to do nothing until the response arrived. Shared by both pages so
 * the two lists filter the same way.
 */
export function FilterChips({
  chips,
  selected,
  param,
}: {
  chips: FilterChip[];
  selected: string;
  param: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div className={`mb-10 flex flex-wrap gap-2 transition-opacity ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
      {chips.map((chip) => {
        const active = chip.value === selected;
        return (
          <button
            key={chip.value || "all"}
            type="button"
            aria-pressed={active}
            onClick={() =>
              startTransition(() => {
                router.push(chip.value ? `${pathname}?${param}=${chip.value}` : pathname);
              })
            }
            className={`min-h-11 rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-igqs-green text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                : "border border-igqs-border-strong hover:bg-igqs-gold/10"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
