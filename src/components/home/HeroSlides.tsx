"use client";

import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Hero carousel. Images go through next/image (AVIF/WebP, width-appropriate
 * variants, immutable caching) instead of raw <img> tags — the originals are
 * full-size uploads and were being shipped as-is. The first slide is
 * prioritised because it is the page's LCP element. Only the current and
 * outgoing slide stay mounted, so later slides are fetched when reached
 * rather than all at once.
 */
export function HeroSlides({ images }: { images: string[] }) {
  const t = useTranslations("a11y");
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const key = images.join("|");
  const previousTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setIndex(0);
    setPrevious(null);
  }, [key]);

  useEffect(() => {
    if (paused || reduced || images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        setPrevious(current);
        return (current + 1) % images.length;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length, paused, reduced]);

  // Drop the outgoing slide once the crossfade is done so only one image
  // stays in the DOM between transitions.
  useEffect(() => {
    if (previous === null) return;
    window.clearTimeout(previousTimer.current);
    previousTimer.current = window.setTimeout(() => setPrevious(null), 700);
    return () => window.clearTimeout(previousTimer.current);
  }, [previous]);

  if (!images.length) return null;

  function go(next: number) {
    setIndex((current) => {
      if (next === current) return current;
      setPrevious(current);
      return next;
    });
  }

  function step(direction: number) {
    go((index + direction + images.length) % images.length);
  }

  const controlClass =
    "motion-control inline-flex size-11 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/70";

  return (
    <div className="absolute inset-0">
      {images.map((src, slideIndex) => {
        if (slideIndex !== index && slideIndex !== previous) return null;
        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              slideIndex === index ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}
      {images.length > 1 && (
        <div className="pointer-events-auto absolute right-3 bottom-4 z-10 flex items-center gap-1 sm:right-6 sm:bottom-6 sm:gap-2">
          <button type="button" className={controlClass} onClick={() => step(-1)} aria-label={t("previousPhoto")}>
            ‹
          </button>
          {images.map((image, imageIndex) => (
            <button
              key={image}
              type="button"
              aria-label={t("photoNumber", { number: imageIndex + 1 })}
              aria-current={imageIndex === index ? "true" : undefined}
              className="inline-flex size-11 items-center justify-center rounded-full"
              onClick={() => go(imageIndex)}
            >
              <span
                className={`motion-control block size-2.5 rounded-full ${
                  imageIndex === index ? "bg-igqs-gold" : "bg-white/70"
                }`}
              />
            </button>
          ))}
          <button type="button" className={controlClass} onClick={() => step(1)} aria-label={t("nextPhoto")}>
            ›
          </button>
          <button
            type="button"
            className={controlClass}
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={paused ? t("playSlideshow") : t("pauseSlideshow")}
          >
            {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
          </button>
        </div>
      )}
    </div>
  );
}
