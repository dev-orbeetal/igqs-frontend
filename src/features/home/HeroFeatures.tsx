import { AirVent, Cctv, Projector, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";

const FEATURES = [
  { key: "featureCctv", icon: Cctv },
  { key: "featureAc", icon: AirVent },
  { key: "featureMultimedia", icon: Projector },
  { key: "featurePower", icon: Zap },
] as const;

/** Fixed facilities shown under the hero. These are part of the school, not CMS copy. */
export async function HeroFeatures() {
  const t = await getTranslations("home");

  return (
    <section aria-label={t("featuresLabel")} className="section-cream border-b border-igqs-gold/30">
      <ul className="section-shell grid grid-cols-2 gap-3 py-4 md:grid-cols-4 md:gap-0 md:py-0">
        {FEATURES.map(({ key, icon: Icon }, index) => (
          <li
            key={key}
            className={`flex items-center gap-3 px-3 py-3.5 max-md:rounded-2xl max-md:border max-md:border-igqs-gold/35 max-md:bg-white/80 md:px-5 md:py-5 dark:max-md:border-igqs-gold/25 dark:max-md:bg-[#10261e] ${
              index > 0 ? "md:border-l md:border-igqs-gold/30" : ""
            }`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-igqs-gold/70 bg-igqs-green text-igqs-gold-soft shadow-[0_8px_18px_rgb(15_61_48/0.16)]">
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="font-display text-[0.95rem] leading-snug text-igqs-green dark:text-igqs-cream sm:text-base">
              {t(key)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
