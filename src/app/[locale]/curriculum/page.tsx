import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BookMarked,
  BookOpen,
  FileDown,
  GraduationCap,
  Languages,
  MoonStar,
  Palette,
  PenLine,
  ScrollText,
  Shapes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { FormattedText } from "@/components/content/FormattedText";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageIntro } from "@/components/seo/PageIntro";
import { SectionHeading } from "@/components/ui/PageHero";
import { DetailsText } from "@/features/home/DetailsText";
import { PersonIdentity } from "@/features/home/HomeSections";
import { apiGet } from "@/lib/api/client";
import { type AboutPayload, type Grade } from "@/lib/api/types";
import { publicPageMetadata } from "@/lib/seo";

type Teacher = AboutPayload["leadership"][number];
type CategoryKey = "quranic" | "islamic" | "general" | "cocurricular";

const CATEGORIES: { key: CategoryKey; icon: LucideIcon }[] = [
  { key: "quranic", icon: BookMarked },
  { key: "islamic", icon: MoonStar },
  { key: "general", icon: Languages },
  { key: "cocurricular", icon: Palette },
];

const GRADE_ICONS = [Sparkles, Shapes, BookOpen, PenLine, ScrollText, BookMarked, GraduationCap];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "curriculum" });
  return publicPageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/curriculum",
  });
}

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("curriculum");
  const nav = await getTranslations("nav");
  const [grades, teachers] = await Promise.all([
    apiGet<Grade[]>("/api/curriculum/", locale),
    apiGet<Teacher[]>("/api/curriculum/instruction/", locale),
  ]);
  const listed = grades ?? [];

  return (
    <div>
      <PageIntro
        title={t("title")}
        subtitle={t("subtitle")}
        crumbs={[
          { name: nav("home"), path: "/" },
          { name: t("title"), path: "/curriculum" },
        ]}
      />
      <div>
        {teachers && teachers.length > 0 && (
          <section className="section-cream section-pad">
            <div className="section-shell">
            <div className="mb-8 flex items-start gap-4">
              <span className="icon-well shrink-0">
                <GraduationCap className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="heading-strong text-[1.9rem] leading-tight text-igqs-green md:text-[2.75rem] dark:text-igqs-gold-soft">
                  {t("instruction")}
                </h2>
                <p className="mt-2 text-sm text-igqs-muted">{t("instructionLead")}</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {teachers.map((teacher, index) => (
                <FadeIn
                  key={teacher.id}
                  delay={index * 0.04}
                  className="hover-lift rounded-3xl border border-igqs-gold/20 bg-white p-5 night-card"
                >
                  <PersonIdentity
                    photo={teacher.photo_url}
                    photoAlt={teacher.name}
                    name={teacher.name}
                    designation={teacher.role}
                  />
                  {teacher.bio ? (
                    <DetailsText
                      text={teacher.bio}
                      lines={4}
                      className="mt-4 whitespace-pre-line text-sm leading-relaxed text-igqs-muted"
                    />
                  ) : null}
                </FadeIn>
              ))}
            </div>
            </div>
          </section>
        )}

        {listed.length === 0 ? (
          <section className="section-white section-pad">
            <p className="section-shell rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
              {t("empty")}
            </p>
          </section>
        ) : (
          <section className="section-white section-pad">
            <div className="section-shell space-y-8">
            <SectionHeading title={t("classes")} />
            <nav aria-label={t("classes")} className="flex flex-wrap gap-2">
              {listed.map((grade, index) => {
                const Icon = GRADE_ICONS[index % GRADE_ICONS.length];
                return (
                  <a
                    key={grade.slug}
                    href={`#grade-${grade.slug}`}
                    className="motion-micro inline-flex min-h-11 items-center gap-2 rounded-full border border-igqs-gold/30 bg-white px-4 py-2 text-sm text-igqs-forest hover:border-igqs-gold hover:bg-igqs-gold/10 night-card dark:text-igqs-gold-soft"
                  >
                    <Icon className="size-4 text-igqs-gold" strokeWidth={1.5} />
                    {grade.name}
                  </a>
                );
              })}
            </nav>
            <div className="space-y-8">
              {listed.map((grade, index) => (
                <GradePanel key={grade.slug} grade={grade} index={index} documentsLabel={t("documents")} categoryLabel={(key) => t(key)} />
              ))}
            </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function GradePanel({
  grade,
  index,
  documentsLabel,
  categoryLabel,
}: {
  grade: Grade;
  index: number;
  documentsLabel: string;
  categoryLabel: (key: CategoryKey) => string;
}) {
  const Icon = GRADE_ICONS[index % GRADE_ICONS.length];
  const groups = CATEGORIES.map((category) => ({
    ...category,
    items: grade.subjects.filter((subject) => subject.category === category.key),
  })).filter((group) => group.items.length > 0);

  return (
    <FadeIn
      id={`grade-${grade.slug}`}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-igqs-gold/20 bg-white night-card"
    >
      <div className="flex items-start gap-4 border-b border-igqs-gold/15 bg-igqs-sand/40 px-6 py-6 md:px-8 dark:bg-white/5">
        <span className="icon-well shrink-0">
          <Icon className="size-5" strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-3xl text-igqs-forest dark:text-igqs-gold-soft">{grade.name}</h2>
          <FormattedText text={grade.description} className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-igqs-muted" />
        </div>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
        {groups.map((group) => {
          const CategoryIcon = group.icon;
          return (
            <div key={group.key} className="rounded-2xl border border-igqs-gold/15 bg-white p-4 dark:bg-white/5">
              <h3 className="flex items-center gap-2.5 text-sm font-semibold text-igqs-forest dark:text-igqs-gold">
                <span className="inline-flex size-8 items-center justify-center rounded-lg border border-igqs-gold/30 bg-white text-igqs-gold dark:bg-[#241c14]">
                  <CategoryIcon className="size-4" strokeWidth={1.5} />
                </span>
                {categoryLabel(group.key)}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((subject) => (
                  <li key={subject.id} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-igqs-gold" aria-hidden />
                    <span>{subject.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {grade.documents.length > 0 && (
        <div className="border-t border-igqs-gold/15 px-6 py-5 md:px-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-igqs-forest dark:text-igqs-gold">
            <FileDown className="size-4 text-igqs-gold" strokeWidth={1.5} />
            {documentsLabel}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {grade.documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.download_url}
                  className="motion-micro inline-flex min-h-11 items-center gap-2 rounded-full border border-igqs-gold/30 px-4 text-sm text-igqs-forest hover:bg-igqs-gold/10 dark:text-igqs-gold-soft"
                >
                  <FileDown className="size-4" strokeWidth={1.5} />
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </FadeIn>
  );
}
