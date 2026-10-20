"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSlides({ images }: { images: string[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [images.join("|")]);

  useEffect(() => {
    if (reduced) setPaused(true);
  }, [reduced]);

  useEffect(() => {
    if (paused || reduced || images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length, paused, reduced]);

  if (!images.length) return null;

  function step(direction: number) {
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  const src = images[index];

  return (
    <div className="absolute inset-0">
      <AnimatePresence>
        <motion.img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: reduced ? 1 : 1.04 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { opacity: { duration: 0.7, ease: "easeOut" }, scale: { duration: 5, ease: "linear" } }
          }
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="pointer-events-auto absolute right-4 bottom-6 z-10 flex items-center gap-2 sm:right-6">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-sm text-white"
            onClick={() => step(-1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
          {images.map((image, imageIndex) => (
            <button
              key={image}
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
            className="ml-1 inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-white"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5 fill-current" />}
          </button>
        </div>
      )}
    </div>
  );
}
