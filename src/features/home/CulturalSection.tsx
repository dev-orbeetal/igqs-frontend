import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionHeading } from "@/components/ui/PageHero";

const ACTIVITIES = [
  {
    image: "/home/cultural/cultural-qiraat.jpg",
    bn: "হদর ও তারতিলসহ বিশুদ্ধ কিরাত প্রশিক্ষণ",
    en: "Training in authentic Quranic recitation (Tilawat) and Qira'at, incorporating Hadr (rapid recitation) and Tartil (measured, rhythmic recitation).",
  },
  {
    image: "/home/cultural/cultural-music.jpg",
    bn: "ইসলামিক সংগীত প্রশিক্ষণ",
    en: "Islamic Music Training",
  },
  {
    image: "/home/cultural/cultural-calligraphy.jpg",
    bn: "ড্রয়িং-ক্রাফট (আর্ট চারুলিপি)",
    en: "Drawing & Craft: Art & Calligraphy",
  },
  {
    image: "/home/cultural/cultural-recitation.jpg",
    bn: "আবৃত্তি ও উপস্থাপনা",
    en: "Recitation & Presentation",
  },
  {
    image: "/home/cultural/cultural-acting.jpg",
    bn: "অভিনয় প্রশিক্ষণ",
    en: "Acting Training",
  },
  {
    image: "/home/cultural/cultural-news.jpg",
    bn: "সংবাদ পাঠ ও উপস্থাপনা",
    en: "News Reading and Presentation",
  },
  {
    image: "/home/cultural/cultural-journalism.jpg",
    bn: "সাংবাদিকতা ও স্পট রিপোর্টিং",
    en: "Journalism and Spot Reporting",
  },
] as const;

export async function CulturalSection() {
  const t = await getTranslations("home");

  return (
    <section id="holistic" className="section-cream section-pad scroll-mt-28">
      <div className="section-shell">
        <SectionHeading title={t("holistic")} className="mb-3" />
        <p className="text-sm leading-relaxed text-igqs-muted">A child needs holistic education</p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-igqs-muted">{t("culturalIntro")}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ACTIVITIES.map((item, index) => (
            <FadeIn key={item.image} delay={index * 0.05} className={index === 0 ? "sm:col-span-2 xl:col-span-3" : ""}>
              <article className="surface-card h-full overflow-hidden bg-white dark:bg-[#12352b]">
                <div className={`relative overflow-hidden border-b border-igqs-gold/25 ${index === 0 ? "h-72 sm:h-80" : "h-56"}`}>
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes={index === 0 ? "(min-width: 1280px) 70vw, 100vw" : "(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"}
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl leading-snug text-igqs-forest dark:text-igqs-gold-soft">{item.bn}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-igqs-muted">{item.en}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
