"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import type { GalleryAlbum } from "@/lib/api";

const CATEGORIES = [
  "",
  "activities",
  "events",
  "classroom",
  "cultural",
  "sports",
  "islamic",
  "campus",
] as const;

export function GalleryGrid({ albums }: { albums: GalleryAlbum[] }) {
  const t = useTranslations("gallery");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (category ? albums.filter((a) => a.category === category) : albums),
    [albums, category]
  );
  const openAlbum = filtered.find((a) => a.slug === active);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map((key) => (
          <button
            key={key || "all"}
            type="button"
            onClick={() => {
              setCategory(key);
              setActive(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm ${
              category === key
                ? "bg-igqs-green text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                : "border border-igqs-gold/30"
            }`}
          >
            {key ? t(key) : t("all")}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((album) => (
          <FadeIn key={album.slug}>
            <button
              type="button"
              onClick={() => setActive(album.slug)}
              className="img-frame w-full rounded-3xl bg-white text-left dark:bg-[#0d1f18]"
            >
              <div className="relative h-52">
                {album.cover_image_url && (
                  <Image
                    src={album.cover_image_url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl">{album.title}</h2>
                <p className="mt-1 text-sm text-igqs-muted">{t("photoCount", { count: album.images.length })}</p>
              </div>
            </button>
          </FadeIn>
        ))}
      </div>
      {openAlbum && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {openAlbum.images.map((image) => (
            <div key={image.id} className="img-frame h-56">
              <Image
                src={image.image}
                alt={image.caption}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
