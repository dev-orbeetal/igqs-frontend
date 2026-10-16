"use client";

import { useEffect, useState } from "react";

export function HeroSlides({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [images.join("|")]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  if (!images.length) return null;

  function step(direction: number) {
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <div className="absolute inset-0">
      {images.map((src, imageIndex) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            imageIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="pointer-events-auto absolute bottom-6 right-4 z-10 flex items-center gap-2 sm:right-6">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-sm text-white"
            onClick={() => step(-1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
          {images.map((src, imageIndex) => (
            <button
              key={src}
              type="button"
              aria-label={`Photo ${imageIndex + 1}`}
              aria-current={imageIndex === index ? "true" : undefined}
              className={`size-2.5 rounded-full ${imageIndex === index ? "bg-igqs-gold" : "bg-white/70"}`}
              onClick={() => setIndex(imageIndex)}
            />
          ))}
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-sm text-white"
            onClick={() => step(1)}
            aria-label="Next photo"
          >
            ›
          </button>
          <button
            type="button"
            className="ml-1 inline-flex h-8 items-center rounded-full bg-black/45 px-3 text-xs text-white"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      )}
    </div>
  );
}
