"use client";

import { useTranslations } from "next-intl";
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { isRichHtml, ReadingParagraphs, sanitizeRichHtml } from "@/components/content/FormattedText";
import { groupAdmission } from "@/lib/prose";

const DESCRIPTION_LINES = 3;

export const HOME_PROSE =
  "max-w-3xl whitespace-pre-line text-sm leading-relaxed text-igqs-ink/90 dark:text-igqs-sand/90";

function DetailsSummary({ kind = "details" }: { kind?: "details" | "more" }) {
  const t = useTranslations("common");
  const closed = kind === "more" ? "seeMore" : "details";
  const open = kind === "more" ? "seeLess" : "closeDetails";
  return (
    <summary className="details-action link-arrow">
      <span className="details-closed">{t(closed)}</span>
      <span className="details-open">{t(open)}</span>
    </summary>
  );
}

export function Disclosure({
  children,
  className = "mt-3",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`details-toggle ${className}`}>
      <DetailsSummary />
      <div className="details-body">{children}</div>
    </details>
  );
}

function looksLong(text: string, lines: number) {
  return text.length > lines * 42 || text.split(/\n/).length > lines;
}

/** Tags and blank lines become spaces, so the preview is six lines of reading. */
function toFlowing(value: string) {
  const plain = isRichHtml(value)
    ? value.replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|div|blockquote|li|h[1-3])>/gi, " ").replace(/<[^>]+>/g, " ")
    : value;
  return plain.replace(/\s+/g, " ").trim();
}

/** Long copy stays at six lines until the reader opens it. */
export function DetailsText({
  text,
  className = "",
  quote = false,
  toggle = "details",
  lines = DESCRIPTION_LINES,
}: {
  text: string;
  className?: string;
  quote?: boolean;
  /** "more" uses See more / See less. Speeches use this. */
  toggle?: "details" | "more";
  /** Visible lines before the control. Speeches use 6; other copy uses 3. */
  lines?: number;
}) {
  const t = useTranslations("common");
  const source = text.trim();
  const boxRef = useRef<HTMLParagraphElement>(null);
  const toggleId = useId();
  const [overflows, setOverflows] = useState(() => looksLong(toFlowing(source), lines));
  const rich = isRichHtml(source);
  // Blank lines and tags would eat the preview. The full text stays in the
  // paragraph; the checkbox only removes the line clamp.
  const flowing = toFlowing(source);
  const shown = !rich && quote ? `“${flowing}”` : flowing;
  const closedLabel = toggle === "more" ? "seeMore" : "details";
  const openLabel = toggle === "more" ? "seeLess" : "closeDetails";
  const style = { "--clamp-lines": String(lines) } as CSSProperties;

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const toggle = el.closest(".text-reveal")?.querySelector<HTMLInputElement>(".text-reveal-toggle");
      if (toggle?.checked) return;
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, className, lines]);

  if (!source) return null;

  const full = rich ? (
    <div className="rich-prose" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(source) }} />
  ) : (
    <ReadingParagraphs text={source} quote={quote} />
  );

  return (
    <div className="text-reveal">
      {overflows ? (
        <div className={`text-reveal-full ${className}`}>{full}</div>
      ) : (
        <div className={className}>{full}</div>
      )}
      {overflows ? (
        <p ref={boxRef} style={style} className={`${className} clamp-lines text-reveal-preview`}>
          {shown}
        </p>
      ) : null}
      {overflows ? (
        <>
          <input id={toggleId} type="checkbox" className="text-reveal-toggle" />
          <label htmlFor={toggleId} className="details-action link-arrow">
            <span className="text-reveal-closed">{t(closedLabel)}</span>
            <span className="text-reveal-open">{t(openLabel)}</span>
          </label>
        </>
      ) : null}
    </div>
  );
}

export function AdmissionNotes({ text }: { text: string }) {
  const t = useTranslations("home");
  const groups = groupAdmission(text);
  return (
    <Disclosure className="">
      {groups ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="heading-strong text-xl text-igqs-green dark:text-igqs-gold-soft">{t("examRules")}</h3>
            <ul className="mt-3 space-y-2">
              {groups.exams.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-igqs-ink/90 dark:text-igqs-sand/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-igqs-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="heading-strong text-xl text-igqs-green dark:text-igqs-gold-soft">{t("requiredPapers")}</h3>
            <ul className="mt-3 space-y-2">
              {groups.papers.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-igqs-ink/90 dark:text-igqs-sand/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-igqs-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className={HOME_PROSE}>{text}</p>
      )}
    </Disclosure>
  );
}
