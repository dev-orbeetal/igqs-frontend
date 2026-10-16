"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FacebookIcon } from "@/components/icons/Social";
import { formatDate } from "@/lib/format";

export type TestimonialItem = {
  id: number;
  name: string;
  role: string;
  quote: string;
  spoken_on: string | null;
  rating: number;
  facebook_url: string;
  image: string;
};

function Stars({ count }: { count: number }) {
  const filled = Math.max(0, Math.min(5, count));
  if (!filled) return null;
  return (
    <p className="mt-4 flex gap-0.5" aria-label={`${filled} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" className="size-4 text-igqs-gold" aria-hidden>
          <path
            fill={index < filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.2"
            d="m10 2.4 2.1 4.4 4.8.7-3.5 3.4.8 4.8L10 13.4 5.8 15.7l.8-4.8L3.1 7.5l4.8-.7L10 2.4z"
          />
        </svg>
      ))}
    </p>
  );
}

function cardsPerView() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

export function Testimonials({ items }: { items: TestimonialItem[] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(1);

  useEffect(() => {
    const update = () => setPerPage(cardsPerView());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pageCount = Math.max(1, Math.ceil(items.length / perPage));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  if (!items.length) return null;

  const visible = items.slice(page * perPage, page * perPage + perPage);
  const roleLabel = (role: string) => (role === "student" ? t("roleStudent") : t("roleGuardian"));

  function step(direction: number) {
    setPage((current) => (current + direction + pageCount) % pageCount);
  }

  return (
    <section className="section-cream section-pad" aria-labelledby="home-testimonials">
      <div className="section-shell">
        <div className="mb-10 text-center">
          <p className="eyebrow">{t("testimonialsKicker")}</p>
          <h2 id="home-testimonials" className="mt-2 font-display text-3xl leading-tight text-igqs-green md:text-[2.45rem] dark:text-igqs-gold-soft">
            {t("testimonials")}
          </h2>
          <div className="heading-rule mx-auto mt-3" />
        </div>

        <div className="relative">
          {pageCount > 1 && (
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-0 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-igqs-gold/40 bg-white text-igqs-green shadow-sm dark:bg-[#12352b] dark:text-igqs-gold-soft"
              aria-label={t("testimonialsPrevious")}
            >
              <ChevronLeft className="size-4" />
            </button>
          )}

          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-2xl border border-igqs-gold/20 bg-white p-5 dark:bg-[#12352b]"
              >
                <div className="flex items-start gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-igqs-green text-igqs-cream">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center font-display text-lg">
                        {item.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{item.name}</h3>
                      {item.facebook_url ? (
                        <a
                          href={item.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                          className="text-[#1877F2]"
                        >
                          <FacebookIcon className="size-4" />
                        </a>
                      ) : null}
                    </div>
                    <p className="text-xs text-igqs-muted">{roleLabel(item.role)}</p>
                    {item.spoken_on ? (
                      <p className="text-xs text-igqs-muted">{formatDate(item.spoken_on, locale)}</p>
                    ) : null}
                  </div>
                </div>
                <Stars count={item.rating} />
                <p className="mt-3 text-sm leading-relaxed text-igqs-ink/80 dark:text-igqs-sand/80">{item.quote}</p>
              </article>
            ))}
          </div>

          {pageCount > 1 && (
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute top-1/2 right-0 z-10 flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-igqs-gold/40 bg-white text-igqs-green shadow-sm dark:bg-[#12352b] dark:text-igqs-gold-soft"
              aria-label={t("testimonialsNext")}
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>

        {pageCount > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t("testimonialsPage", { page: index + 1 })}
                aria-current={index === page}
                onClick={() => setPage(index)}
                className={`size-2 rounded-full ${index === page ? "bg-igqs-green dark:bg-igqs-gold" : "bg-igqs-gold/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
