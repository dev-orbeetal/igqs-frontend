"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPhoto } from "@/components/ui/AdminPhoto";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { btn } from "@/components/ui/button-styles";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { staffRequest } from "@/lib/staff/client";

type Slide = { id: number; image_src: string };

function imageName(url: string) {
  const path = url.split("?")[0].split("#")[0];
  const name = path.split("/").pop() ?? "";
  try {
    return decodeURIComponent(name).toLowerCase();
  } catch {
    return name.toLowerCase();
  }
}

export function HeroSlideEditor() {
  const t = useTranslations("cms");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [heroName, setHeroName] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function reload() {
    const data = await staffRequest<Slide[] | { results: Slide[] }>("/api/staff/hero-slides/");
    setSlides(Array.isArray(data) ? data : (data.results ?? []));
  }

  useEffect(() => {
    reload().catch(() => setError(t("error")));
    staffRequest<Record<string, unknown>>("/api/staff/home/")
      .then((home) => {
        const src = String(home.hero_image || home.hero_image_url || "");
        setHeroName(imageName(src));
      })
      .catch(() => setHeroName(""));
  }, [t]);

  async function upload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    for (const file of files) form.append("images", file);
    try {
      await staffRequest("/api/staff/hero-slides/bulk/", { method: "POST", body: form });
      setInputKey((key) => key + 1);
      await reload();
    } catch (error) {
      setError(error instanceof Error && error.message ? error.message : t("error"));
    } finally {
      setUploading(false);
    }
  }

  async function replace(id: number, file: File) {
    setError("");
    const form = new FormData();
    form.append("image", file);
    try {
      await staffRequest(`/api/staff/hero-slides/${id}/`, { method: "PATCH", body: form });
      await reload();
    } catch (error) {
      setError(error instanceof Error && error.message ? error.message : t("error"));
      throw error;
    }
  }

  async function remove(id: number) {
    setError("");
    try {
      await staffRequest(`/api/staff/hero-slides/${id}/`, { method: "DELETE" });
      await reload();
    } catch {
      setError(t("error"));
    }
  }

  const extras = slides.filter((slide) => imageName(slide.image_src) !== heroName || !heroName);

  return (
    <div className="grid gap-4">
      {extras.length === 0 ? (
        <p className="text-sm text-igqs-muted">{t("noHeroSlides")}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {extras.map((slide) => (
            <div key={slide.id} className="grid gap-1">
              {slide.image_src && (
                <AdminPhoto src={slide.image_src} onCropped={(file) => replace(slide.id, file)} />
              )}
              <button type="button" className={btn.danger} onClick={() => setPendingId(slide.id)}>
                {t("removeUpload")}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-dashed border-igqs-border-strong bg-white p-4 text-sm dark:border-igqs-gold/70 dark:bg-[#10261e]">
        <p className="font-medium">{t("addHeroSlides")}</p>
        <span className="mt-1 block text-xs text-igqs-muted">{t("heroSlidesHint")}</span>
        <ImageFileInput key={inputKey} multiple disabled={uploading} onFiles={(files) => void upload(files)} />
      </div>
      <p aria-live="polite" className="text-sm text-igqs-muted">
        {uploading ? t("uploading") : ""}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={pendingId !== null}
        title={t("confirmTitle")}
        message={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onCancel={() => setPendingId(null)}
        onConfirm={() => {
          const id = pendingId;
          setPendingId(null);
          if (id) void remove(id);
        }}
      />
    </div>
  );
}
