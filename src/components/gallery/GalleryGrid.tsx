"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [shownSlug, setShownSlug] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef<string | null>(null);
  const closingRef = useRef(false);

  const filtered = useMemo(
    () => (category ? albums.filter((a) => a.category === category) : albums),
    [albums, category]
  );
  const openAlbum = filtered.find((a) => a.slug === active);
  const shownAlbum = filtered.find((a) => a.slug === shownSlug) ?? albums.find((a) => a.slug === shownSlug);

  // Opening an album used to append photos far below the album grid with no
  // scroll, no heading and no way to close — it looked like nothing happened.
  useEffect(() => {
    if (active) {
      shownRef.current = active;
      closingRef.current = false;
      setClosing(false);
      setShownSlug(active);
      return;
    }
    if (!shownRef.current) return;
    closingRef.current = true;
    setClosing(true);
  }, [active]);

  useEffect(() => {
    if (!closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shownRef.current = null;
      closingRef.current = false;
      setShownSlug(null);
      setClosing(false);
    }
  }, [closing]);

  useEffect(() => {
    if (!openAlbum || !panelRef.current) return;
    panelRef.current.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    panelRef.current.focus({ preventScroll: true });
  }, [openAlbum]);

  useEffect(() => {
    if (!shownAlbum) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shownAlbum]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map((key) => (
          <button
            key={key || "all"}
            type="button"
            aria-pressed={category === key}
            onClick={() => {
              setCategory(key);
              setActive(null);
            }}
            className={`motion-micro min-h-11 rounded-full px-4 py-2 text-sm ${
              category === key
                ? "bg-igqs-green text-igqs-cream dark:bg-igqs-gold dark:text-igqs-ink"
                : "border border-igqs-border-strong hover:bg-igqs-gold/10"
            }`}
          >
            {key ? t(key) : t("all")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-igqs-gold/40 px-5 py-10 text-center text-igqs-muted">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((album, index) => {
            const expanded = album.slug === active;
            return (
              <FadeIn key={album.slug} delay={index * 0.08}>
                <button
                  type="button"
                  onClick={() => setActive(expanded ? null : album.slug)}
                  aria-expanded={expanded}
                  aria-controls="gallery-album-panel"
                  className={`surface-card surface-card-hover w-full overflow-hidden bg-white text-left dark:bg-[#0d1f18] ${
                    expanded ? "ring-2 ring-igqs-gold" : ""
                  }`}
                >
                  <div className="relative h-52">
                    {album.cover_image_url && (
                      <Image
                        src={album.cover_image_url}
                        alt={album.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="img-zoom object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-2xl">{album.title}</h2>
                    <p className="mt-1 text-sm text-igqs-muted">
                      {t("photoCount", { count: album.images.length })}
                    </p>
                  </div>
                </button>
              </FadeIn>
            );
          })}
        </div>
      )}

      {shownAlbum && (
        <div
          id="gallery-album-panel"
          ref={panelRef}
          tabIndex={-1}
          key={shownAlbum.slug}
          className={`mt-12 scroll-mt-24 rounded-3xl border border-igqs-gold/25 bg-white/70 p-5 sm:p-6 dark:bg-white/5 ${
            closing ? "panel-out" : "panel-in"
          }`}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget || event.animationName !== "panel-out" || !closingRef.current) {
              return;
            }
            shownRef.current = null;
            closingRef.current = false;
            setShownSlug(null);
            setClosing(false);
          }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl">{t("viewing", { album: shownAlbum.title })}</h2>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="motion-micro inline-flex min-h-11 items-center gap-2 rounded-full border border-igqs-border-strong px-4 text-sm hover:bg-igqs-gold/10"
            >
              <X className="size-4" aria-hidden />
              {t("close")}
            </button>
          </div>
          {shownAlbum.images.length === 0 ? (
            <p className="py-6 text-center text-igqs-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shownAlbum.images.map((image, index) => (
                <div
                  key={image.id}
                  className="photo-in img-frame h-56"
                  style={{ "--photo-index": Math.min(index, 5) } as React.CSSProperties}
                >
                  <Image
                    src={image.image}
                    alt={image.caption || shownAlbum.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
