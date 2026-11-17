import Image from "next/image";
import type { ReactNode } from "react";
import { DetailsText, Disclosure, HOME_PROSE } from "@/features/home/DetailsText";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionHeading } from "@/components/ui/PageHero";
import { Link } from "@/i18n/navigation";
import type { AdmissionFeeInfo, PaymentMethodInfo } from "@/lib/api/types";
import { isNoteLabel } from "@/lib/prose";

export function HomeBand({
  id,
  title,
  tone = "cream",
  align = "left",
  children,
}: {
  id: string;
  title: string;
  tone?: "cream" | "white";
  align?: "left" | "center";
  children: ReactNode;
}) {
  const surface = tone === "white" ? "section-white" : "section-cream";
  return (
    <section id={id} className={`${surface} section-pad scroll-mt-28`}>
      <div className="section-shell">
        <FadeIn>
          <SectionHeading title={title} align={align} />
        </FadeIn>
        <FadeIn delay={0.05}>{children}</FadeIn>
      </div>
    </section>
  );
}

export function Prose({ children, preview = 1 }: { children: string; preview?: number }) {
  return <DetailsText text={children} className={HOME_PROSE} preview={preview} />;
}

export function SplitCopy({
  id,
  title,
  body,
  image,
  imageAlt,
}: {
  id: string;
  title: string;
  body: string;
  image?: string;
  imageAlt: string;
}) {
  return (
    <section id={id} className="section-white section-pad scroll-mt-28">
      <div className={`section-shell grid items-center gap-10 ${image ? "lg:grid-cols-2 lg:gap-14" : ""}`}>
        <FadeIn variant="left">
          <SectionHeading title={title} />
          <DetailsText text={body} className={HOME_PROSE} preview={3} />
        </FadeIn>
        {image ? (
          <FadeIn delay={0.1} variant="right" className="img-frame-offset ml-4 mb-4 sm:ml-5">
            <div className="img-frame min-h-64 shadow-[0_18px_40px_rgb(16_35_28/0.14)] sm:min-h-80">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="parallax-soft object-cover"
              />
            </div>
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}

type Speaker = {
  label: string;
  name?: string;
  title?: string;
  message?: string;
  photo?: string;
};

export function LeaderMessages({
  id,
  heading,
  people,
}: {
  id: string;
  heading: string;
  people: Speaker[];
}) {
  const shown = people.filter((person) => person.message || person.name || person.photo);
  if (!shown.length) return null;

  return (
    <section id={id} className="section-cream section-pad scroll-mt-28">
      <div className="section-shell">
        <FadeIn>
          <SectionHeading title={heading} align="center" />
        </FadeIn>
        <div className={`mx-auto grid max-w-5xl gap-6 ${shown.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {shown.map((person) => (
            <FadeIn key={person.label}>
              <article
                className={`surface-card grid gap-6 overflow-hidden border-t-4 border-t-igqs-gold bg-white p-6 md:p-8 dark:bg-[#12352b] ${
                  person.photo ? "sm:grid-cols-[160px_1fr]" : ""
                }`}
              >
                {person.photo ? (
                  <div className="img-frame relative h-48 sm:h-auto sm:min-h-44">
                    <Image
                      src={person.photo}
                      alt={person.name || person.label}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="eyebrow">{person.label}</p>
                  {person.message ? (
                    <DetailsText
                      text={person.message}
                      unit="paragraphs"
                      preview={1}
                      quote
                      className="principal-quote mt-3 whitespace-pre-line text-base leading-relaxed text-igqs-green dark:text-igqs-gold-soft"
                    />
                  ) : null}
                  {person.name ? (
                    <footer className="mt-5 text-sm">
                      <strong>{person.name}</strong>
                      {person.title ? <span className="block text-igqs-muted">{person.title}</span> : null}
                    </footer>
                  ) : null}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VisionMission({
  visionTitle,
  vision,
  missionTitle,
  mission,
}: {
  visionTitle: string;
  vision: string;
  missionTitle: string;
  mission: string;
}) {
  return (
    <section className="section-white section-pad scroll-mt-28">
      <div className={`section-shell grid gap-6 ${vision && mission ? "md:grid-cols-2" : ""}`}>
        {vision ? (
          <FadeIn id="vision" className="surface-card bg-igqs-green p-7 text-igqs-cream sm:p-8">
            <h2 className="heading-strong text-[1.9rem] leading-tight text-white md:text-[2.4rem]">{visionTitle}</h2>
            <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-igqs-cream/90">{vision}</p>
          </FadeIn>
        ) : null}
        {mission ? (
          <FadeIn id="mission" delay={0.08} className="surface-card bg-white p-7 sm:p-8 dark:bg-[#12352b]">
            <h2 className="heading-strong text-[1.9rem] leading-tight text-igqs-green md:text-[2.4rem] dark:text-igqs-gold-soft">
              {missionTitle}
            </h2>
            <p className={`mt-4 ${HOME_PROSE}`}>{mission}</p>
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}

export function FacilityGrid({
  items,
}: {
  items: { id: number; title: string; description: string; image_url: string }[];
}) {
  if (!items.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((item, index) => (
        <FadeIn key={item.id} delay={index * 0.06}>
          <article className="surface-card grid overflow-hidden bg-white md:grid-cols-2 dark:bg-[#12352b]">
            {item.image_url ? (
              <div className="img-frame min-h-40 rounded-none border-y-0 border-l-0">
                <Image src={item.image_url} alt={item.title} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
              </div>
            ) : null}
            <div className="p-5">
              <h3 className="heading-strong text-[1.35rem] leading-snug text-igqs-green dark:text-igqs-gold-soft">
                {item.title}
              </h3>
              {item.description ? (
                <DetailsText
                  text={item.description}
                  preview={1}
                  className="mt-2 whitespace-pre-line text-sm leading-relaxed text-igqs-muted"
                />
              ) : null}
            </div>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}

export function ProcedureList({
  steps,
  applyHref,
  applyLabel,
}: {
  steps: string[];
  applyHref: string;
  applyLabel: string;
}) {
  return (
    <div>
      <ol className="max-w-3xl space-y-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-2xl border border-igqs-gold/25 bg-white px-4 py-3 text-sm leading-relaxed sm:text-base dark:bg-[#12352b]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-igqs-gold text-sm text-igqs-ink">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <Link href={applyHref} className="btn-green mt-7 inline-flex">
        {applyLabel}
      </Link>
    </div>
  );
}

export function FeeTable({
  fees,
  allClassesLabel,
}: {
  fees: AdmissionFeeInfo[];
  allClassesLabel: string;
}) {
  if (!fees.length) return null;
  return (
    <ul className="surface-card divide-y divide-igqs-gold/15 overflow-hidden bg-white dark:bg-[#12352b]">
      {fees.map((fee) => (
        <li
          key={`${fee.grade_slug ?? "default"}-${fee.label}`}
          className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4"
        >
          <div>
            <p className="font-medium">{fee.grade_name || allClassesLabel}</p>
            <p className="text-sm text-igqs-muted">{fee.label}</p>
          </div>
          <p className="heading-strong text-[1.45rem] text-igqs-green dark:text-igqs-gold-soft">{fee.display}</p>
        </li>
      ))}
    </ul>
  );
}

function PaymentFacts({ method }: { method: PaymentMethodInfo }) {
  const rows = method.details ?? [];
  const notes = rows.filter((detail) => isNoteLabel(detail.label));
  const facts = rows.filter((detail) => !isNoteLabel(detail.label));
  return (
    <div className="mt-3 space-y-2">
      {facts.map((detail, index) => (
        <p key={`${detail.label}-${index}`} className="text-sm leading-relaxed text-igqs-muted">
          {detail.label ? <span className="text-igqs-gold">{detail.label}: </span> : null}
          <span className="whitespace-pre-wrap">{detail.value}</span>
        </p>
      ))}
      {notes.length > 0 ? (
        <Disclosure>
          <div className="space-y-2">
            {notes.map((detail, index) => (
              <p key={`${detail.label}-${index}`} className="text-sm leading-relaxed text-igqs-muted whitespace-pre-wrap">
                {detail.value}
              </p>
            ))}
          </div>
        </Disclosure>
      ) : null}
    </div>
  );
}

export function PaymentGrid({ methods }: { methods: PaymentMethodInfo[] }) {
  if (!methods.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {methods.map((method) => (
        <article key={method.code} className="surface-card bg-white p-5 dark:bg-[#12352b]">
          <h3 className="heading-strong text-[1.4rem] text-igqs-green dark:text-igqs-gold-soft">{method.name}</h3>
          <PaymentFacts method={method} />
        </article>
      ))}
    </div>
  );
}
