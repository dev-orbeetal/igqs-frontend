import { Award, GraduationCap, Sparkles, Users } from "lucide-react";

const ICONS = {
  users: Users,
  "graduation-cap": GraduationCap,
  award: Award,
  sparkles: Sparkles,
} as const;

export type Highlight = {
  id: number;
  value: string;
  label: string;
  icon: string;
};

export function Highlights({ items, label }: { items: Highlight[]; label: string }) {
  if (!items.length) return null;

  return (
    <section className="border-y border-igqs-gold/25 bg-igqs-green text-igqs-cream" aria-label={label}>
      <h2 className="sr-only">{label}</h2>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-8 sm:px-6 md:grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Users;
          return (
            <div key={item.id} className="flex flex-col items-center px-3 text-center">
              <Icon className="size-8 text-igqs-gold" strokeWidth={1.5} aria-hidden />
              <p className="mt-2 font-display text-4xl leading-none text-igqs-gold">{item.value}</p>
              <p className="mt-1.5 text-sm text-igqs-cream/80">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
