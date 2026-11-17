"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { btn } from "@/components/ui/button-styles";

type Frame = { x: number; y: number; w: number; h: number };

const START_FRAME: Frame = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

function fileStem(name: string) {
  const clean = name.split("?")[0].split("#")[0].split("/").pop() || "photo";
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function downloadPhoto(src: string, filename: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("download");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function cropFile(image: HTMLImageElement, frame: Frame, filename: string) {
  const width = Math.max(1, Math.round(image.naturalWidth * frame.w));
  const height = Math.max(1, Math.round(image.naturalHeight * frame.h));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(
    image,
    image.naturalWidth * frame.x,
    image.naturalHeight * frame.y,
    width,
    height,
    0,
    0,
    width,
    height,
  );
  const stem = fileStem(filename).replace(/\.[a-z0-9]+$/i, "");
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("blob"));
        return;
      }
      resolve(new File([blob], `${stem}-cropped.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
}

export function AdminPhoto({
  src,
  fileName,
  onCropped,
}: {
  src: string;
  fileName?: string;
  onCropped?: (file: File) => void | Promise<void>;
}) {
  const t = useTranslations("cms");
  const previewRef = useRef<HTMLDialogElement>(null);
  const cropRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewTitle = useId();
  const cropTitle = useId();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [frame, setFrame] = useState<Frame>(START_FRAME);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const drag = useRef<{ mode: "move" | "resize"; x: number; y: number; frame: Frame } | null>(null);

  useEffect(() => {
    const preview = previewRef.current;
    const crop = cropRef.current;
    if (preview) {
      if (previewOpen && !preview.open) preview.showModal();
      if (!previewOpen && preview.open) preview.close();
    }
    if (crop) {
      if (cropOpen && !crop.open) crop.showModal();
      if (!cropOpen && crop.open) crop.close();
    }
  }, [previewOpen, cropOpen]);

  function downloadName() {
    return fileName || fileStem(src);
  }

  async function download() {
    setError("");
    try {
      await downloadPhoto(src, downloadName());
    } catch {
      setError(t("downloadFailed"));
    }
  }

  function beginDrag(mode: "move" | "resize", event: React.PointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, x: event.clientX, y: event.clientY, frame };
  }

  function moveDrag(event: React.PointerEvent<HTMLElement>) {
    const active = drag.current;
    const image = imageRef.current;
    if (!active || !image) return;
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = (event.clientX - active.x) / rect.width;
    const dy = (event.clientY - active.y) / rect.height;
    if (active.mode === "move") {
      setFrame({
        ...active.frame,
        x: clamp(active.frame.x + dx, 0, 1 - active.frame.w),
        y: clamp(active.frame.y + dy, 0, 1 - active.frame.h),
      });
      return;
    }
    setFrame({
      ...active.frame,
      w: clamp(active.frame.w + dx, 0.08, 1 - active.frame.x),
      h: clamp(active.frame.h + dy, 0.08, 1 - active.frame.y),
    });
  }

  function endDrag() {
    drag.current = null;
  }

  async function applyCrop() {
    const image = imageRef.current;
    if (!image || !image.naturalWidth) return;
    setBusy(true);
    setError("");
    try {
      const file = await cropFile(image, frame, downloadName());
      if (!onCropped) return;
      await onCropped(file);
      setCropOpen(false);
    } catch {
      setError(t("cropFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button type="button" className="block" onClick={() => setPreviewOpen(true)} aria-label={t("previewPhoto")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a stored or local photo */}
        <img src={src} alt="" width={320} height={160} className="h-40 w-full max-w-xs rounded-xl object-cover" />
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btn.secondary} onClick={() => setPreviewOpen(true)}>
          {t("previewPhoto")}
        </button>
        <button type="button" className={btn.secondary} onClick={() => void download()}>
          {t("downloadPhoto")}
        </button>
        {onCropped ? (
          <button
            type="button"
            className={btn.secondary}
            onClick={() => {
              setFrame(START_FRAME);
              setError("");
              setCropOpen(true);
            }}
          >
            {t("cropPhoto")}
          </button>
        ) : null}
      </div>
      {error && !cropOpen ? (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <dialog
        ref={previewRef}
        aria-labelledby={previewTitle}
        className="w-[min(100%-2rem,56rem)] rounded-2xl border border-igqs-border-strong bg-white p-4 text-igqs-ink backdrop:bg-black/50 dark:border-igqs-gold/70 dark:bg-[#0d1f18] dark:text-igqs-sand"
        onCancel={(event) => {
          event.preventDefault();
          setPreviewOpen(false);
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={previewTitle} className="font-display text-2xl">
            {t("previewPhoto")}
          </h2>
          <button type="button" className={btn.secondary} onClick={() => setPreviewOpen(false)}>
            {t("closePreview")}
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- full-size admin preview */}
        <img src={src} alt="" className="max-h-[70vh] w-full rounded-xl object-contain" />
      </dialog>

      <dialog
        ref={cropRef}
        aria-labelledby={cropTitle}
        className="w-[min(100%-2rem,48rem)] rounded-2xl border border-igqs-border-strong bg-white p-4 text-igqs-ink backdrop:bg-black/50 dark:border-igqs-gold/70 dark:bg-[#0d1f18] dark:text-igqs-sand"
        onCancel={(event) => {
          event.preventDefault();
          if (!busy) setCropOpen(false);
        }}
      >
        <h2 id={cropTitle} className="font-display text-2xl">
          {t("cropTitle")}
        </h2>
        <p className="mt-1 text-sm text-igqs-muted">{t("cropHint")}</p>
        <div className="mt-4 inline-block max-w-full">
          <div className="relative inline-block max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- canvas crop needs the decoded image */}
            <img
              ref={imageRef}
              src={src}
              alt=""
              crossOrigin="anonymous"
              className="max-h-[60vh] max-w-full select-none"
              draggable={false}
            />
            <div
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
              style={{ left: `${frame.x * 100}%`, top: `${frame.y * 100}%`, width: `${frame.w * 100}%`, height: `${frame.h * 100}%` }}
              onPointerDown={(event) => beginDrag("move", event)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
            >
              <button
                type="button"
                aria-label={t("cropPhoto")}
                className="absolute -right-2 -bottom-2 size-4 cursor-nwse-resize rounded-sm border border-igqs-ink bg-white"
                onPointerDown={(event) => beginDrag("resize", event)}
              />
            </div>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btn.primary} disabled={busy} onClick={() => void applyCrop()}>
            {busy ? t("saving") : t("cropApply")}
          </button>
          <button type="button" className={btn.secondary} disabled={busy} onClick={() => setCropOpen(false)}>
            {t("cancel")}
          </button>
        </div>
      </dialog>
    </div>
  );
}
