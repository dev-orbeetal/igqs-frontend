import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageIntro } from "@/components/seo/PageIntro";
import { apiGet, type Grade } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

const CATEGORY_KEYS = ["quranic", "islamic", "general", "cocurricular"] as const;

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
  const grades = await apiGet<Grade[]>("/api/curriculum/", locale);

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
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6">
        {(grades?.length ?? 0) === 0 && (
          <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
            {t("empty")}
          </p>
        )}
        {grades?.map((grade) => (
          <FadeIn
            key={grade.slug}
            id={`grade-${grade.slug}`}
            className="scroll-mt-28 rounded-3xl border border-igqs-gold/20 bg-white p-6 dark:bg-[#0d1f18] md:p-8"
          >
            <h2 className="font-display text-3xl text-igqs-forest dark:text-igqs-gold-soft">
              {grade.name}
            </h2>
            <p className="mt-3 max-w-prose whitespace-pre-line text-igqs-muted">{grade.description}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {CATEGORY_KEYS.map((key) => {
                const items = grade.subjects.filter((s) => s.category === key);
                if (!items.length) return null;
                return (
                  <div key={key}>
                    <h3 className="text-sm uppercase tracking-[0.2em] text-igqs-forest dark:text-igqs-gold">
                      {t(key)}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {items.map((subject) => (
                        <li key={subject.id} className="rounded-xl bg-igqs-cream px-4 py-3 dark:bg-white/5">
                          {subject.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {grade.documents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm uppercase tracking-[0.2em] text-igqs-forest dark:text-igqs-gold">
                  {t("documents")}
                </h3>
                <ul className="mt-3">
                  {grade.documents.map((doc) => (
                    <li key={doc.id}>
                      <a href={doc.download_url} className="motion-micro text-sm text-igqs-forest underline hover:text-igqs-green dark:text-igqs-gold-soft dark:hover:text-igqs-gold">
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
