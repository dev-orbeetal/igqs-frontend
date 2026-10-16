"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/staff/ConfirmDialog";
import { btn } from "@/components/staff/buttons";
import { ImageFileInput } from "@/components/ui/ImageFileInput";
import { staffRequest } from "@/lib/staff";

type Slide = { id: number; image_src: string };

export function HeroSlideEditor() {
  const t = useTranslations("cms");
  const [slides, setSlides] = useState<Slide[]>([]);
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

  async function remove(id: number) {
    setError("");
    try {
      await staffRequest(`/api/staff/hero-slides/${id}/`, { method: "DELETE" });
      await reload();
    } catch {
      setError(t("error"));
    }
  }

  return (
    <div className="grid gap-4">
      {slides.length === 0 ? (
        <p className="text-sm text-igqs-muted">{t("noHeroSlides")}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {slides.map((slide) => (
            <div key={slide.id} className="grid gap-1">
              {slide.image_src && (
                <img src={slide.image_src} alt="" className="h-24 w-36 rounded-xl object-cover" />
              )}
              <button type="button" className={btn.danger} onClick={() => setPendingId(slide.id)}>
                {t("removeUpload")}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-dashed border-igqs-gold/50 bg-white p-4 text-sm dark:bg-[#10261e]">
        <p className="font-medium">{t("addHeroSlides")}</p>
        <span className="mt-1 block text-xs text-igqs-muted">{t("heroSlidesHint")}</span>
        <ImageFileInput key={inputKey} multiple disabled={uploading} onFiles={(files) => void upload(files)} />
      </div>
      {uploading && <p className="text-sm text-igqs-muted">{t("uploading")}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
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
