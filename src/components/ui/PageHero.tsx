import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/motion/FadeIn";

export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const brand = useTranslations("brand");
  return (
    <section className="on-dark pattern-geo-dark border-y border-igqs-gold bg-igqs-forest py-12 text-igqs-cream print:hidden dark:bg-[#0b241c] sm:py-16">
      <FadeIn className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow">{brand("name")}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-igqs-cream/80">{subtitle}</p>
        )}
      </FadeIn>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  tone = "light",
  className = "",
}: {
  kicker?: string;
  title: string;
  tone?: "light" | "onDark";
  className?: string;
}) {
  const onDark = tone === "onDark";
  return (
    <div className={`mb-8 ${className}`}>
      {kicker && <p className="eyebrow">{kicker}</p>}
      <h2
        className={`mt-2 font-display text-3xl leading-tight md:text-[3.0625rem] ${
          onDark ? "text-igqs-cream" : "text-igqs-forest dark:text-igqs-gold-soft"
        }`}
      >
        {title}
      </h2>
      <div className="heading-rule mt-3" />
    </div>
  );
}
