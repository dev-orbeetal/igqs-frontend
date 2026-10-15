"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function HeroSlides({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images.join("|")]);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <>
      {images.map((src, imageIndex) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={imageIndex === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-500 ${
            imageIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
